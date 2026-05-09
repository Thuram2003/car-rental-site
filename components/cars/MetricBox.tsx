import { Card } from "@/components/ui/card";

interface MetricBoxProps {
  icon: React.ElementType;
  label: string;
  value: string;
}

export function MetricBox({ icon: Icon, label, value }: MetricBoxProps) {
  return (
    <Card className="bg-white p-4 border-gray-100 hover:border-gray-200 transition-colors">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-gray-400" />
        <p className="text-xs text-gray-500 font-medium">{label}</p>
      </div>
      <p className="text-xl font-semibold text-gray-900">{value}</p>
    </Card>
  );
}
