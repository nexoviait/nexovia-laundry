import { useForm } from '@inertiajs/react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
    });

    function submit(e) {
        e.preventDefault();
        post('/admin/login');
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100">
            <form onSubmit={submit} className="w-full max-w-sm rounded-lg bg-white p-8 shadow">
                <h1 className="text-xl font-semibold mb-1">Clean Quick Laundry</h1>
                <p className="text-sm text-slate-500 mb-6">Admin sign in</p>

                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                    type="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    className="w-full rounded border border-slate-300 px-3 py-2 mb-1"
                    autoFocus
                />
                {errors.email && <p className="text-sm text-red-600 mb-2">{errors.email}</p>}

                <label className="block text-sm font-medium text-slate-700 mb-1 mt-3">Password</label>
                <input
                    type="password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    className="w-full rounded border border-slate-300 px-3 py-2 mb-1"
                />
                {errors.password && <p className="text-sm text-red-600 mb-2">{errors.password}</p>}

                <button
                    type="submit"
                    disabled={processing}
                    className="mt-4 w-full rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
                >
                    Sign in
                </button>
            </form>
        </div>
    );
}
