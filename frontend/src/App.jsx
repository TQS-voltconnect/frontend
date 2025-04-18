import { useState } from "react";
import "./index.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-blue-600 mb-4">
        React + Tailwind Test
      </h1>
      <button
        onClick={() => setCount(count + 1)}
        className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded shadow transition duration-300"
      >
        Clicked {count} {count === 1 ? "time" : "times"}
      </button>
    </div>
  );
}

export default App;
