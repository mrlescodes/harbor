import { PolarisProvider } from "./polaris-provider";
import { SessionProvider } from "./session-provider";

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers = (props: ProvidersProps) => {
  const { children } = props;

  return (
    <PolarisProvider>
      <SessionProvider>{children}</SessionProvider>
    </PolarisProvider>
  );
};
