import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Modern Card Component with consistent styling and animations
 */
const ModernCard = ({
  children,
  title,
  subtitle,
  icon: Icon,
  className = '',
  hover = true,
  gradient = false,
  glassmorphism = true,
  ...props
}) => {
  const cardClasses = `
    ${glassmorphism ? 'bg-white/80 backdrop-blur-xl border-white/20' : 'bg-white'}
    ${gradient ? 'bg-gradient-to-br from-white/90 to-white/70' : ''}
    shadow-xl border-0 rounded-2xl overflow-hidden
    ${className}
  `;

  const CardWrapper = hover ? motion.div : 'div';
  const hoverProps = hover ? {
    whileHover: { y: -5, scale: 1.02 },
    transition: { duration: 0.2, ease: "easeOut" }
  } : {};

  return (
    <CardWrapper {...hoverProps}>
      <Card className={cardClasses} {...props}>
        {(title || Icon) && (
          <CardHeader className="pb-4">
            <div className="flex items-center gap-4">
              {Icon && (
                <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <Icon className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                {title && (
                  <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">
                    {title}
                  </CardTitle>
                )}
                {subtitle && (
                  <p className="text-gray-600 mt-1">{subtitle}</p>
                )}
              </div>
            </div>
          </CardHeader>
        )}
        <CardContent className={title || Icon ? 'pt-0' : ''}>
          {children}
        </CardContent>
      </Card>
    </CardWrapper>
  );
};

export default ModernCard;