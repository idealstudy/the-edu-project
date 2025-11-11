'use client';

import { forwardRef } from 'react';
import type { ComponentPropsWithoutRef, ElementRef } from 'react';

import { cn } from '@/shared/lib';
import * as AccordionPrimitive from '@radix-ui/react-accordion';

import { Icon } from './icon';

const Accordion = AccordionPrimitive.Root;

/* -------------------------------------------------------------------------------------------------
 * AccordionItem
 * -----------------------------------------------------------------------------------------------*/
const AccordionItem = forwardRef<
  ElementRef<typeof AccordionPrimitive.Item>,
  ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn(
      'border-line-line1/70 rounded-2xl border bg-white/5 backdrop-blur-sm',
      className
    )}
    {...props}
  />
));
AccordionItem.displayName = 'AccordionItem';

/* -------------------------------------------------------------------------------------------------
 * AccordionTrigger
 * -----------------------------------------------------------------------------------------------*/
const AccordionTrigger = forwardRef<
  ElementRef<typeof AccordionPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        'flex flex-1 items-center justify-between gap-3 rounded-2xl px-5 py-4 text-left text-base font-semibold transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40',
        className
      )}
      {...props}
    >
      <span className="flex flex-col gap-1">{children}</span>
      <Icon.ChevronDown
        aria-hidden
        className="h-4 w-4 shrink-0 transition-transform data-[state=open]:rotate-180"
      />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

/* -------------------------------------------------------------------------------------------------
 * AccordionContent
 * -----------------------------------------------------------------------------------------------*/
const AccordionContent = forwardRef<
  ElementRef<typeof AccordionPrimitive.Content>,
  ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className={cn(
      'overflow-hidden text-sm transition-all data-[state=closed]:max-h-0 data-[state=open]:max-h-[440px]',
      className
    )}
    {...props}
  >
    <div className="px-5 pt-0 pb-5 text-sm leading-[160%] text-white/85">
      {children}
    </div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

const Root = Accordion;
const Item = AccordionItem;
const Trigger = AccordionTrigger;
const Content = AccordionContent;

export { Root, Item, Trigger, Content };
