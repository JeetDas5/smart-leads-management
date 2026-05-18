import { LoginForm } from "@/components/login-form";
import { ModeToggle } from "@/components/mode-toggle";

const LoginPage = () => {
  return (
    <div className='relative min-h-screen w-full flex flex-col items-center justify-center bg-background px-4 overflow-hidden transition-colors duration-300'>
      <div className='absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none dark:bg-indigo-500/5 transition-all' />
      <div className='absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none dark:bg-blue-500/5 transition-all' />

      <div className='absolute top-6 right-6 z-50'>
        <ModeToggle />
      </div>

      <div className='w-full max-w-md z-10 flex flex-col gap-4'>
        <div className='text-center space-y-2'>
          <h1 className='text-3xl font-extrabold tracking-tight text-foreground'>
            Smart Leads
          </h1>
          <p className='text-sm text-muted-foreground'>
            Simplify, organize,  and accelerate your lead workflow
          </p>
        </div>

        <LoginForm className='shadow-2xl rounded-2xl bg-card/85 backdrop-blur-md transition-all duration-300 border border-border/50 hover:shadow-primary/5' />
      </div>
    </div>
  );
};

export default LoginPage;
