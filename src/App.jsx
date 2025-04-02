import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import './App.css'; // Ensure the CSS file is imported

const defaultCategories = ["餐饮🍛", "医疗💊", "交通🚗", "娱乐🎢"];
const colors = ["#FF6384", "#36A2EB", "#FFCE56", "#4CAF50", "#9966FF"];

function App() {
  const [showVideo, setShowVideo] = useState(true);
  const [transactions, setTransactions] = useState(() => JSON.parse(localStorage.getItem("transactions")) || []);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("餐饮");
  const [isIncome, setIsIncome] = useState("expense");
  const [categories, setCategories] = useState(() => JSON.parse(localStorage.getItem("categories")) || defaultCategories);
  const [newCategory, setNewCategory] = useState("");
  const [showTransactions, setShowTransactions] = useState(false);
  const [showCategoryManagement, setShowCategoryManagement] = useState(false);
  const [totalIncome, setTotalIncome] = useState(() => JSON.parse(localStorage.getItem("totalIncome")) || 0);
  const [totalExpense, setTotalExpense] = useState(() => JSON.parse(localStorage.getItem("totalExpense")) || 0);

  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
    localStorage.setItem("categories", JSON.stringify(categories));
    localStorage.setItem("totalIncome", JSON.stringify(totalIncome));
    localStorage.setItem("totalExpense", JSON.stringify(totalExpense));
  }, [transactions, categories, totalIncome, totalExpense]);

  const addTransaction = () => {
    if (!amount || isNaN(amount)) return;
    const newTransaction = {
      id: Date.now(),
      amount: parseFloat(amount),
      category,
      type: isIncome,
      date: new Date().toLocaleString(),
    };
    setTransactions([...transactions, newTransaction]);
    if (isIncome === "expense") {
      setTotalExpense(totalExpense + parseFloat(amount));
    } else {
      setTotalIncome(totalIncome + parseFloat(amount));
    }
    setAmount("");
  };

  const deleteTransaction = (id) => {
    const transaction = transactions.find((t) => t.id === id);
    if (transaction && transaction.type === "expense") {
      setTotalExpense(totalExpense - transaction.amount);
    } else {
      setTotalIncome(totalIncome - transaction.amount);
    }
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  const addCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
      setNewCategory("");
    }
  };

  const deleteCategory = (cat) => {
    setCategories(categories.filter(c => c !== cat));
  };

  const balance = totalIncome - totalExpense;
  const data = categories.map((cat, index) => ({
    name: cat,
    value: transactions.filter((t) => t.category === cat && t.type === "expense").reduce((sum, t) => sum + t.amount, 0),
    color: colors[index % colors.length],
  }));

  if (showVideo) {
    return (
      <div className="container">
        <div className="video-container">
          <video
            autoPlay
            loop
            muted
            className="w-full h-auto"
          >
            <source src="/background.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        <button
          onClick={() => setShowVideo(false)}
          className="bg-blue-500 text-white p-4 rounded"
        >
          记账
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="relative min-h-screen">
        <div className="relative z-10 flex items-center justify-center min-h-screen p-6 max-w-xl mx-auto bg-white shadow-md rounded-xl">
          <h1 className="text-2xl font-bold mb-4 gradient-text">chiikawa 记账</h1>
          <h2 className="text-xl font-bold">总收入: ¥{totalIncome.toFixed(2)}</h2>
          <h2 className="text-xl font-bold">总支出: ¥{totalExpense.toFixed(2)}</h2>
          <h2 className="text-xl font-bold">余额: ¥{balance.toFixed(2)}</h2>

          <div className="input-group mb-4 flex">
            <select value={isIncome} onChange={(e) => setIsIncome(e.target.value)} className="border p-2 rounded">
              <option value="income">收入</option>
              <option value="expense">支出</option>
            </select>
            <input type="number" placeholder="金额" value={amount} onChange={(e) => setAmount(e.target.value)}
                   className="border p-2 rounded mx-2"/>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="border p-2 rounded">
              {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
              ))}
              <option value="custom">其他（请于分类管理中手动输入）</option>
            </select>
            <button onClick={addTransaction} className="ml-2 bg-blue-500 text-white p-2 rounded">添加</button>
          </div>

          <button onClick={() => setShowCategoryManagement(!showCategoryManagement)}
                  className="mt-4 bg-gray-500 text-white p-2 rounded">分类管理
          </button>
          {showCategoryManagement && (
              <div>
                <h2 className="text-xl font-bold mt-4">分类管理</h2>
                <div>
                  <input type="text" placeholder="新增分类" value={newCategory}
                         onChange={(e) => setNewCategory(e.target.value)} className="border p-2 rounded"/>
                  <button onClick={addCategory} className="ml-2 bg-green-500 text-white p-2 rounded">添加</button>
                </div>
                <ul>
                  {categories.map((cat) => (
                      <li key={cat} className="flex justify-between p-2 border-b">
                      {cat} <button onClick={() => deleteCategory(cat)} className="text-red-500">删除</button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="chart-container">
            <PieChart width={400} height={400}>
              <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </div>

          <div className="relative">
            <button onClick={() => setShowTransactions(!showTransactions)} className="mt-4 bg-gray-500 text-white p-2 rounded">账单详情</button>
            {showTransactions && (
              <div className="absolute bg-white p-4 border rounded shadow-lg w-full max-h-80 overflow-auto">
                <ul>
                  {transactions.map((t) => (
                    <li key={t.id} className="flex justify-between p-2 border-b">
                      {t.date} - {t.type === "expense" ? "支出" : "收入"} ¥{t.amount} [{t.category}]
                      <button onClick={() => deleteTransaction(t.id)} className="text-red-500">删除</button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;