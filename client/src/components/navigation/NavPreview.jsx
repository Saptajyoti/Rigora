import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';

const navigationClass = ({ isActive }) =>
  `transition hover:text-cyan-300 ${isActive ? 'text-cyan-300' : 'text-zinc-300'}`;

export default function NavPreview({
  align = 'center',
  children,
  label,
  onOpen,
  to,
  triggerClassName = '',
}) {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const closeTimer = useRef(null);
  const openTimer = useRef(null);
  const triggerRef = useRef(null);

  useEffect(
    () => () => {
      window.clearTimeout(closeTimer.current);
      window.clearTimeout(openTimer.current);
    },
    [],
  );

  const show = (delayed = false) => {
    window.clearTimeout(closeTimer.current);
    window.clearTimeout(openTimer.current);

    const reveal = () => {
      setOpen(true);
      onOpen?.();
    };

    if (delayed) openTimer.current = window.setTimeout(reveal, 90);
    else reveal();
  };

  const hide = () => {
    window.clearTimeout(openTimer.current);
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpen(false), 160);
  };

  const close = () => {
    window.clearTimeout(openTimer.current);
    window.clearTimeout(closeTimer.current);
    setOpen(false);
  };

  const positionClass = align === 'right' ? 'right-0' : 'left-1/2 -translate-x-1/2';

  return (
    <div
      className="relative hidden md:block"
      onMouseEnter={() => show(true)}
      onMouseLeave={hide}
      onFocus={() => show()}
      onBlur={hide}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          close();
          triggerRef.current?.focus();
        }

        if (event.key === 'Enter' || event.key === 'ArrowDown' || event.key === ' ') {
          event.preventDefault();
          show();
        }
      }}
    >
      <NavLink
        ref={triggerRef}
        to={to}
        className={(linkState) => `${navigationClass(linkState)} ${triggerClassName}`}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        {label}
      </NavLink>
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label={`${label} preview`}
            className={`rigora-glass rigora-nav-preview absolute top-[calc(100%+0.75rem)] z-50 w-[min(22rem,calc(100vw-2rem))] rounded-2xl p-3 ${positionClass}`}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -5, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.985 }}
            transition={{ duration: reduceMotion ? 0.01 : 0.18 }}
            onMouseEnter={() => show()}
            onMouseLeave={hide}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
