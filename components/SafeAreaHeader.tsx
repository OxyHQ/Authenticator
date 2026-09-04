import { H2 } from '@oxyhq/bloom/typography';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SafeAreaHeaderProps {
  title: string;
}

export default function SafeAreaHeader({ title }: SafeAreaHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View className="border-b border-border bg-card" style={{ paddingTop: insets.top }}>
      <H2 className="mx-4 my-3 text-2xl font-semibold text-foreground">{title}</H2>
    </View>
  );
}
