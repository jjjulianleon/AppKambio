import React, { useState } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/constants';

// Import tab components
import MetasTab from './tabs/MetasTab';
import AhorrosTab from './tabs/AhorrosTab';
import GastosTab from './tabs/GastosTab';

const FinancesScreen = ({ navigation }) => {
  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'metas', title: 'Metas' },
    { key: 'ahorros', title: 'Ahorros' },
    { key: 'gastos', title: 'Gastos' }
  ]);

  const renderScene = SceneMap({
    metas: () => <MetasTab navigation={navigation} />,
    ahorros: () => <AhorrosTab navigation={navigation} />,
    gastos: () => <GastosTab navigation={navigation} />
  });

  const renderTabBar = props => (
    <TabBar
      {...props}
      indicatorStyle={styles.tabIndicator}
      style={styles.tabBar}
      labelStyle={styles.tabLabel}
      activeColor={COLORS.primary}
      inactiveColor={COLORS.textSecondary}
      pressColor={COLORS.primaryLight}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        renderTabBar={renderTabBar}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        style={styles.tabView}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  tabView: {
    flex: 1
  },
  tabBar: {
    backgroundColor: COLORS.surface,
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  tabIndicator: {
    backgroundColor: COLORS.primary,
    height: 3,
    borderRadius: BORDER_RADIUS.xs
  },
  tabLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    textTransform: 'none',
    letterSpacing: 0
  }
});

export default FinancesScreen;
