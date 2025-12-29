import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      position="top-right"
      duration={5000}
      closeButton
      richColors
      toastOptions={{
        className: 'shadow-lg border',
        classNames: {
          error: 'bg-red-600 text-white border-red-700',
          success: 'bg-green-600 text-white border-green-700',
          warning: 'bg-yellow-600 text-white border-yellow-700',
          info: 'bg-blue-600 text-white border-blue-700',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
