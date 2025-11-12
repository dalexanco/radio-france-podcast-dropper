import { Box, Text } from "ink";
import Divider from "../ui/Divider";

export default function Layout({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <Box flexDirection="column" padding={1}>
      <Box flexDirection="column" marginBottom={1}>
        <Divider type="-" width={20} />
        <Box>
          <Text bold color="cyan">{title}</Text>
        </Box>
      </Box>

      {children}
    </Box>
  );
}