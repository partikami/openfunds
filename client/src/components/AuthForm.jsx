import { Form, Link, useSearchParams } from "react-router";

function AuthForm() {
  const [searchParams] = useSearchParams();
  const isLogin = searchParams.get("mode") === "login";

  return (
    <>
      <Form>
        <div className="text-gray-100">
          <h1 className="flex justify-center text-2xl mt-14 mb-10 ">
            {isLogin ? "Log in" : "Create a new account"}
          </h1>
          <div className="flex flex-col justify-center max-w-2xl mx-auto">
            <div className="mb-2">
              <label
                className="tracking-wide text-gray-100 text-lg font-bold"
                htmlFor="email"
              >
                Email
              </label>
            </div>

            <div className="mb-4">
              <input
                className="appearance-none min-w-full min-h-8 bg-gray-200 text-gray-700 border border-gray-700 rounded py-0 px-0 mb-0"
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="flex flex-col justify-center max-w-2xl mx-auto">
            <div className="mb-2">
              <label
                className="tracking-wide text-gray-100 text-lg font-bold"
                htmlFor="password"
              >
                Password
              </label>
            </div>

            <div className="mb-12">
              <input
                className="appearance-none w-full min-h-8 bg-gray-200 text-gray-700 border border-gray-700 rounded py-0 px-0 mb-0"
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              className="py-2 px-4 float-right text-center text-cyan-900 font-bold text-lg border-2 border-cyan-900 bg-white hover:bg-gray-300 hover:text-gray-800 rounded-lg transition duration-300"
            >
              {isLogin ? "Login" : "Sign up"}
            </button>
          </div>

          <div className="flex flex-col justify-center max-w-2xl mx-auto text-lg">
            <div className="mt-16">
              {isLogin
                ? "Being here for the first time?"
                : "Already having an account?"}

              <Link
                className="ml-8 py-4 underline"
                to={`?mode=${isLogin ? "signup" : "login"}`}
              >
                {isLogin ? "Signup" : "Login"}
              </Link>
            </div>
          </div>
        </div>
      </Form>
    </>
  );
}

export default AuthForm;
