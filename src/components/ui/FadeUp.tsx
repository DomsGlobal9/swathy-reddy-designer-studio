import React from 'react';
import { motion } from 'framer-motion';
import { easeOut } from '../../utils/format';

type FadeUpProps = {
  children: React.ReactNode;
  delay?: number;
  className?: string;
};

export function FadeUp({ children, delay = 0, className = '' }: FadeUpProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.3, ease: easeOut, delay }}>
      
      {children}
    </motion.div>);

}