export const metadata = {
  title: "Power Assist 24h",
  description: "Sistema de gerenciamento de assistência 24h",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          padding: 0,
          fontFamily: "Arial, Helvetica, sans-serif",
          backgroundColor: "#f5f5f5",
        }}
      >
        {children}
      </body>
    </html>
  );
}
