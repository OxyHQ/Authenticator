import { Screen, ScreenScrollView } from '@oxy.so/bloom/screen';
import { useIsFocused } from 'expo-router';
import type { ReactNode } from 'react';

import SafeAreaHeader from './SafeAreaHeader';

interface AppScreenProps {
  title: string;
  children: ReactNode;
  contentContainerClassName?: string;
}

/** Expo Tabs owns navigation; Bloom owns each page's header and scroll viewport. */
export default function AppScreen({ title, children, contentContainerClassName }: AppScreenProps) {
  const active = useIsFocused();

  return (
    <Screen
      active={active}
      scroll="auto"
      documentScroll={false}
      header={<SafeAreaHeader title={title} />}
      contentClearance={0}
    >
      <ScreenScrollView contentContainerClassName={contentContainerClassName}>
        {children}
      </ScreenScrollView>
    </Screen>
  );
}
