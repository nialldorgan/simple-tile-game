import GameBoard from '@/components/gameBoard'
import { PaperProvider } from 'react-native-paper'
import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context'


export default function Index() {
  return (
    <PaperProvider>
      <SafeAreaProvider>
        <SafeAreaView>
          <GameBoard></GameBoard>
        </SafeAreaView>
      </SafeAreaProvider>
    </PaperProvider>
  );
}
