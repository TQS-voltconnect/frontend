import React, { useState } from 'react';
import loginImage from '/src/assets/login.png'; // Importando a imagem de login

const LoginPage = ({ onLogin }) => {
    const [name, setName] = useState('');
    const [role, setRole] = useState('DRIVER');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name.trim() === '') return alert('Please enter your name.');
        onLogin({ name, role });
    };

    return (
        <div className="flex flex-col md:flex-row items-stretch min-h-screen bg-green-100 px-6 md:px-12">
            <div className="hidden md:flex md:w-1/2 h-full justify-center items-center bg-white md:ml-6">
                <img
                    src={loginImage}
                    alt="Login visual"
                    className="w-full h-full object-cover rounded-lg"
                />
            </div>
            <div className="flex w-full md:w-1/2 justify-center items-center ">
                <form
                    onSubmit={handleSubmit}
                    className="bg-white p-6 md:p-8 rounded shadow-md w-full max-w-lg"
                >
                    <h2 className="text-2xl font-semibold mb-6 text-center">Login</h2>

                    <label className="block mb-2 font-medium" htmlFor="name">
                        Username
                    </label>
                    <input
                        id="name"
                        type="text"
                        className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your Username"
                        required
                    />

                    <label className="block mb-2 font-medium">Role</label>
                    <div className="flex flex-wrap gap-4 mb-6">
                        {['DRIVER', 'OPERATOR', 'TECHNICIAN', 'ADMIN'].map((r) => (
                            <label key={r} className="inline-flex items-center space-x-2">
                                <input
                                type="radio"
                                name="role"
                                value={r}
                                checked={role === r}
                                onChange={() => setRole(r)}
                                className="accent-emerald-600 focus:ring-emerald-500"
                                />

                                <span className="text-gray-700 capitalize">{r.toLowerCase()}</span>
                            </label>
                        ))}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-emerald-600 text-white py-2 rounded hover:bg-emerald-700 transition"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
