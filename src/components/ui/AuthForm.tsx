'use client';

import { useRouter } from 'next/navigation';
import React, { useTransition } from 'react';
import { CardContent, CardFooter } from './card';
import { Label } from '@radix-ui/react-label';
import { Input } from './input';
import { Button } from './button';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { loginAction, SignUpAction } from '@/actions/users';

type Props = {
  type: 'login' | 'signUp';
};

function AuthForm({ type }: Props) {
  const isLoginForm = type === 'login';
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const email = formData.get('email') as string;
      const password = formData.get('password') as string; // ✅ fixed

      let errorMessage: string | null = null;
      let title = '';
      let description = '';

      if (isLoginForm) {
        const res = await loginAction(email, password);
        errorMessage = res.errorMessage;
        title = 'Logged in';
        description = 'You have successfully logged in.';
      } else {
        const res = await SignUpAction(email, password);
        errorMessage = res.errorMessage;
        title = 'Signed Up';
        description = 'Check your email for the confirmation link.';
      }

      if (!errorMessage) {
        toast.success(title, { description }); 
        router.replace('/');
      } else {
        toast.error(`${isLoginForm ? 'Login' : 'Sign Up'} Failed`, {
          description: errorMessage,
        });
      }
    });
  };

  return (
    <form action={handleSubmit}>
      <CardContent className="grid w-full items-center gap-4">
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            placeholder="Enter Your Email"
            type="email"
            required
            disabled={isPending}
          />
        </div>
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            placeholder="Enter your password"
            type="password"
            required
            disabled={isPending}
          />
        </div>
      </CardContent>
      <CardFooter className="mt-4 flex flex-col gap-6">
        <Button className="w-full" disabled={isPending}>
          {isPending ? (
            <Loader2 className="animate-spin" />
          ) : isLoginForm ? (
            'Login'
          ) : (
            'Sign Up'
          )}
        </Button>
        <p className="text-xs">
          {isLoginForm ? "Don't have an account yet?" : 'Already have an account?'}{' '}
          <Link
            href={isLoginForm ? '/sign-up' : '/login'}
            className={`text-blue-500 underline ${
              isPending ? 'pointer-events-none opacity-50' : ''
            }`}
          >
            {isLoginForm ? 'Sign Up' : 'Login'}
          </Link>
        </p>
      </CardFooter>
    </form>
  );
}

export default AuthForm;
