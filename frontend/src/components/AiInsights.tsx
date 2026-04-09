import { useEffect, useState } from "react";
import axios from "axios";

export function AiInsights({ user }: any) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/ai/insights/${user._id}`)
      .then(res => setData(res.data));
  }, [user]);

  if (!data) return <p>Loading insights...</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">AI Spending Insights</h2>

      <p>Total Spent: PKR {data.totalSpent}</p>

      {data.categoryInsights.map((c: any) => (
        <div key={c.category}>
          {c.category}: PKR {c.amount} ({c.percentage}%)
        </div>
      ))}
    </div>
  );
}
