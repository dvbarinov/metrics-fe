export const COLORS = {
    primary: '#3b82f6',      // blue-500
    secondary: '#10b981',    // emerald-500
    success: '#10b981',
    warning: '#f59e0b',      // amber-500
    danger: '#ef4444',       // red-500
    info: '#06b6d4',         // cyan-500
    purple: '#a855f7',       // purple-500
    pink: '#ec4899',         // pink-500
    gray: '#6b7280',         // gray-500
};

export const getGradientColor = (color, opacity = 0.3) => {
    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    };

    const rgb = hexToRgb(color);
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
};

// Генерация цветов для разных тегов
export const generateTagColors = (tags) => {
    const colorList = [
        COLORS.primary,
        COLORS.secondary,
        COLORS.warning,
        COLORS.danger,
        COLORS.info,
        COLORS.purple,
        COLORS.pink,
        COLORS.gray,
    ];

    return tags.reduce((acc, tag, index) => {
        acc[tag] = colorList[index % colorList.length];
        return acc;
    }, {});
};