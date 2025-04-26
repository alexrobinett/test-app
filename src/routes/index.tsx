import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import { useAppForm } from '../hooks/demo.form'

export const Route = createFileRoute('/')({
  component: LoginForm,
})

function LoginForm() {
  const navigate = useNavigate();
  const schema = z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
  });

  const form = useAppForm({
    defaultValues: {
      username: '',
      password: '',
    },
    validators: {
      onBlur: schema,
    },
    onSubmit: ({ value }) => {
      console.log(value);
      navigate({ to: '/dashboard' });
    },
  });

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-100">
      <div className="w-full max-w-sm p-8 bg-white rounded-2xl shadow-lg border border-neutral-200 flex flex-col items-center">
        <div className="mb-6 w-full text-center">
          <span className="inline-block w-10 h-10 bg-neutral-900 rounded-full mb-2"></span>
          <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">Sign in</h1>
          <p className="text-neutral-400 text-sm">Welcome back! Please login to your account.</p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-5 w-full"
        >
          <form.AppField name="username">
            {(field) => (
              <field.TextField
                label="Username"

              />
            )}
          </form.AppField>

         <form.AppField name="password">
            {(field) => (
              <field.TextField
                label="Password"
                type="password"
              />
            )}
          </form.AppField>

          <div className="flex justify-end pt-2">
            <form.AppForm>
              <form.SubscribeButton label="Login" className="bg-neutral-900 hover:bg-neutral-800 text-white font-semibold rounded-lg px-6 py-2 transition" />
            </form.AppForm>
          </div>
        </form>
      </div>
    </div>
  )
}
