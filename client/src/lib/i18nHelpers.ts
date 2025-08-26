import React from 'react';
import { Messages } from './i18n';

/**
 * Deeply applies translations to a component's props
 * This helps ensure that all string values are properly translated
 * 
 * @param props Object of component props that may contain strings to translate
 * @param messages Messages object containing translations
 * @returns New props with translations applied
 */
export function applyTranslations(props: any, messages: Messages): any {
  if (!props || !messages) return props;
  
  // If props is a string, try to translate it
  if (typeof props === 'string') {
    // Check if the string looks like a translation key
    if (props.includes('.') && !props.includes(' ')) {
      const translated = getNestedTranslation(props, messages);
      return translated !== props ? translated : props;
    }
    return props;
  }
  
  // If props is an array, translate each item
  if (Array.isArray(props)) {
    return props.map(item => applyTranslations(item, messages));
  }
  
  // If props is an object, translate each value
  if (typeof props === 'object') {
    const result: Record<string, any> = {};
    for (const key in props) {
      result[key] = applyTranslations(props[key], messages);
    }
    return result;
  }
  
  return props;
}

/**
 * Gets a nested translation value from a dot-notation path
 * 
 * @param key Translation key in dot notation (e.g., "common.buttons.save")
 * @param messages Messages object containing translations
 * @returns Translated string or the original key if not found
 */
export function getNestedTranslation(key: string, messages: Messages): string {
  const keys = key.split('.');
  let current: any = messages;
  
  for (const k of keys) {
    if (current && typeof current === 'object' && k in current) {
      current = current[k];
    } else {
      return key; // Return original key if path not found
    }
  }
  
  return typeof current === 'string' ? current : key;
}

/**
 * HOC to wrap a component with translation capabilities
 * 
 * @param Component The component to wrap
 * @returns A new component with translations applied to props
 */
export function withTranslations<P extends { messages: Messages }>(Component: React.ComponentType<P>) {
  return function WrappedComponent(props: P) {
    const translatedProps = applyTranslations(props, props.messages);
    return React.createElement(Component, translatedProps);
  };
}

/**
 * TranslationProvider component props
 */
interface TranslationProviderProps {
  messages: Messages;
  children: React.ReactNode;
}

/**
 * Create a helper component to automatically apply translations to children
 */
export function TranslationProvider(props: TranslationProviderProps) {
  const { messages, children } = props;
  
  const childrenWithTranslations = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      // Apply translations to this child's props
      const translatedProps = applyTranslations(child.props, messages);
      return React.cloneElement(child, { ...translatedProps, messages });
    }
    return child;
  });
  
  // Use React.Fragment directly instead of JSX syntax
  return React.createElement(React.Fragment, null, childrenWithTranslations);
}