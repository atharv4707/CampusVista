import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Button } from "../ui/Button";
import { ChevronDown, ChevronUp, GripVertical } from "lucide-react";

type Panel = { id: string; title: string; content: React.ReactNode };

export function PanelsStack({ title, panels }: { title: string; panels: Panel[] }) {
  const [order, setOrder] = useState(panels.map(p => p.id));
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setOrder(prev => {
      const set = new Set(panels.map(p => p.id));
      const next = prev.filter(id => set.has(id));
      for (const p of panels) if (!next.includes(p.id)) next.push(p.id);
      return next;
    });
  }, [panels]);

  const byId = new Map(panels.map(p => [p.id, p]));
  const orderedPanels = order.map(id => byId.get(id)).filter(Boolean) as Panel[];

  const move = (id: string, dir: -1 | 1) => {
    setOrder(prev => {
      const i = prev.indexOf(id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <div className="text-xs text-white/50">Reorder + collapse</div>
      </CardHeader>
      <CardContent className="space-y-2">
        {orderedPanels.map(p => {
          const isCollapsed = !!collapsed[p.id];
          return (
            <div key={p.id} className="rounded-2xl border border-white/10 bg-white/[0.05]">
              <div className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-2">
                  <GripVertical size={16} className="text-white/35" />
                  <div className="text-sm font-semibold">{p.title}</div>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" onClick={() => move(p.id, -1)} title="Move up">
                    <ChevronUp size={16} />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => move(p.id, 1)} title="Move down">
                    <ChevronDown size={16} />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCollapsed(x => ({ ...x, [p.id]: !x[p.id] }))}
                  >
                    {isCollapsed ? "Expand" : "Collapse"}
                  </Button>
                </div>
              </div>

              <AnimatePresence initial={false}>
                {!isCollapsed && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-3">{p.content}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
