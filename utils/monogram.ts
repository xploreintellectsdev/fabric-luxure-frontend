export const isMonogramSupported = (productTypeName: string | undefined): boolean => {
    if (!productTypeName) return false;
    
    const supportedTypes = ['shirt', 'pant', 'blazer', 'shorts'];
    const normalizedType = productTypeName.toLowerCase().trim();
    
    // Check if the product type name contains any of the supported keywords
    return supportedTypes.some(type => normalizedType.includes(type));
};
