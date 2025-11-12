import { Text } from "ink";
import { AsyncState } from "react-use/lib/useAsyncFn";

export default function FutureSwitch<T>({
  asyncState,
  dependencies = [],
  children,
}: {
  asyncState: AsyncState<T>;
  dependencies?: any[];
  children: React.ReactNode;
}) {
  const isDependenciesLoading = dependencies.some(
    (dependency) => dependency.loading
  );
  const isDependenciesError = dependencies.some(
    (dependency) => dependency.error
  );
  const isLoading = asyncState.loading || isDependenciesLoading;
  const isError = !!asyncState.error;

  if (isLoading || isDependenciesLoading) return <Text>Loading...</Text>;
  if (isError) return <Text>Error: {asyncState.error.message}</Text>;
  if (isDependenciesError || !asyncState.value) return null;

  return children;
}
