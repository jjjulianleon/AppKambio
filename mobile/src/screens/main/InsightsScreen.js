import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    SafeAreaView
} from 'react-native';
import { COLORS, SPACING, FONTS, FONT_SIZES, SHADOWS } from '../../utils/constants';
import { getInsight } from '../../services/insightService';

const InsightsScreen = ({ navigation }) => {
    const [insight, setInsight] = useState('');
    const [loading, setLoading] = useState(true);
    const [analyzedCount, setAnalyzedCount] = useState(0);

    useEffect(() => {
        fetchInsight();
    }, []);

    const fetchInsight = async () => {
        try {
            setLoading(true);
            const data = await getInsight();
            setInsight(data.insight);
            setAnalyzedCount(data.analyzedTransactions);
        } catch (error) {
            setInsight('Hubo un problema al conectar con tu asistente financiero. Intenta más tarde.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>Tu Coach Financiero 🤖</Text>
                    <Text style={styles.subtitle}>
                        Analizando tus patrones de consumo para ayudarte a ahorrar mejor.
                    </Text>
                </View>

                <View style={styles.card}>
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={COLORS.primary} />
                            <Text style={styles.loadingText}>Analizando tus gastos...</Text>
                        </View>
                    ) : (
                        <>
                            <View style={styles.insightHeader}>
                                <Text style={styles.insightTitle}>💡 Consejo del Día</Text>
                            </View>
                            {analyzedCount > 0 && (
                                <View style={styles.metaContainer}>
                                    <Text style={styles.metaText}>
                                        📊 Basado en {analyzedCount} transacción{analyzedCount !== 1 ? 'es' : ''}
                                    </Text>
                                </View>
                            )}
                            <Text style={styles.insightText}>{insight}</Text>
                        </>
                    )}
                </View>

                <TouchableOpacity
                    style={styles.refreshButton}
                    onPress={fetchInsight}
                    disabled={loading}
                >
                    <Text style={styles.refreshButtonText}>
                        {loading ? 'Analizando...' : 'Generar Nuevo Consejo'}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    content: {
        padding: SPACING.lg,
    },
    header: {
        marginBottom: SPACING.xl,
    },
    title: {
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES.xxl,
        color: COLORS.text,
        marginBottom: SPACING.xs,
    },
    subtitle: {
        fontFamily: FONTS.regular,
        fontSize: FONT_SIZES.md,
        color: COLORS.textSecondary,
        lineHeight: 22,
    },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: 20,
        padding: SPACING.xl,
        marginBottom: SPACING.xl,
        ...SHADOWS.md,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    },
    loadingContainer: {
        alignItems: 'center',
        padding: SPACING.xl,
    },
    loadingText: {
        marginTop: SPACING.md,
        color: COLORS.textSecondary,
        fontFamily: FONTS.medium,
    },
    insightHeader: {
        marginBottom: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
        paddingBottom: SPACING.sm,
    },
    insightTitle: {
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES.lg,
        color: COLORS.primary,
    },
    metaContainer: {
        backgroundColor: COLORS.primaryAlpha10,
        paddingVertical: SPACING.xs,
        paddingHorizontal: SPACING.sm,
        borderRadius: 8,
        marginBottom: SPACING.md,
        alignSelf: 'flex-start',
    },
    metaText: {
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZES.xs,
        color: COLORS.primary,
        fontWeight: '600',
    },
    insightText: {
        fontFamily: FONTS.regular,
        fontSize: FONT_SIZES.md,
        color: COLORS.text,
        lineHeight: 26,
    },
    refreshButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: SPACING.md,
        borderRadius: 12,
        alignItems: 'center',
        ...SHADOWS.sm,
    },
    refreshButtonText: {
        color: COLORS.textLight,
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES.md,
    },
});

export default InsightsScreen;
