import { Navbar } from "@/app/(root)/components/navbar";
import Auth from "@/components/shared/utils/auth";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Auth redirect={false}>
        <Navbar />
      </Auth>
      {children}
    </>
  );
}
