import { Box, Text } from "ink";

export default function Divider({
  color,
  width = 10,
  type = "=",
}: {
  color?: string;
  width?: number;
  type?: "=" | "-";
}) {
  return (
    <Box>
      <Text color={color}>
        {Array.from({ length: width }, (_, i) => type).join("")}
      </Text>
    </Box>
  );
}
