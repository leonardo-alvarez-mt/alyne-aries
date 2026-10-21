import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { IconBolt } from '@tabler/icons-react';
import {
  WELCOME_CARDS,
  LIMITATIONS,
  ICON_EXPAND,
  ICON_CLOSE,
} from './welcomeCardsConfig';
import { ariesFocus } from './ariesUi';

const cardSurfaceClassName =
  'cursor-pointer rounded-2xl bg-[#f2f7fd] transition-colors hover:bg-[#e8f1fc] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067D2]';

const expandTransition = {
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1],
};

function CollapsedCard({ card, onOpen }) {
  return (
    <motion.button
      type="button"
      layout="position"
      aria-expanded={false}
      onClick={onOpen}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={expandTransition}
      className={`welcome-card-collapsed flex h-[58px] shrink-0 items-center overflow-hidden px-4 py-3 ${cardSurfaceClassName}`}
    >
      <span className="flex min-w-0 items-center gap-4">
        <span className="flex size-[34px] shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white">
          <img
            src={card.icon}
            alt=""
            aria-hidden="true"
            width={20}
            height={20}
            className="size-5 shrink-0 object-contain"
            style={{ width: 20, height: 20, maxWidth: 'none' }}
          />
        </span>
        <span className="whitespace-nowrap font-[Poppins,sans-serif] text-sm font-medium leading-[1.57] tracking-[0.1px] text-[#001a35]">
          {card.label}
        </span>
        <img
          src={ICON_EXPAND}
          alt=""
          aria-hidden="true"
          width={12}
          height={12}
          className="size-3 shrink-0"
          style={{ width: 12, height: 12, maxWidth: 'none' }}
        />
      </span>
    </motion.button>
  );
}

function ExpandedCard({ card, onClose, onTryPrompt }) {
  return (
    <div className="w-full rounded-2xl bg-[#f2f7fd] p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="flex items-center gap-3">
        <span className="flex size-[34px] shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white">
          <img
            src={card.icon}
            alt=""
            aria-hidden="true"
            width={20}
            height={20}
            className="size-5 shrink-0 object-contain"
            style={{ width: 20, height: 20, maxWidth: 'none' }}
          />
        </span>
        <span className="min-w-0 flex-1 whitespace-normal font-[Poppins,sans-serif] text-sm font-medium leading-[1.57] tracking-[0.1px] text-[#001a35]">
          {card.label}
        </span>
        <button
          type="button"
          aria-label={`Close ${card.label}`}
          onClick={onClose}
          className={`welcome-card-close flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#e4ebf3] transition-colors hover:bg-[#d7e1ec] ${ariesFocus}`}
        >
          <img
            src={ICON_CLOSE}
            alt=""
            aria-hidden="true"
            width={12}
            height={12}
            className="size-3"
            style={{ width: 12, height: 12, maxWidth: 'none' }}
          />
        </button>
      </div>

      <p className="mt-3 font-[Poppins,sans-serif] text-sm font-normal leading-[1.43] tracking-[0.17px] text-[#666]">
        {card.description}
      </p>
      <ul className="mt-2 flex flex-col gap-1 font-[Poppins,sans-serif] text-sm font-normal leading-[1.43] tracking-[0.17px] text-[#666]">
        {card.bullets.map((bullet) => (
          <li key={bullet} className="flex gap-2">
            <span aria-hidden="true">-</span>
            <span>{bullet}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 rounded-xl bg-white px-3.5 py-3">
        <p className="m-0 font-[Poppins,sans-serif] text-sm font-medium leading-[1.57] tracking-[0.1px] text-[#001a35]">
          Try this prompt:
        </p>
        <button
          type="button"
          onClick={() => onTryPrompt?.(card.prompt)}
          className={`mt-2 inline-flex max-w-full cursor-pointer items-start gap-2 rounded-md text-left ${ariesFocus}`}
        >
          <IconBolt size={16} stroke={1.75} className="mt-0.5 shrink-0 text-[#64748B]" />
          <span className="font-[Poppins,sans-serif] text-sm font-medium leading-[1.43] text-[#001a35] underline underline-offset-2">
            {card.prompt}
          </span>
        </button>
      </div>
    </div>
  );
}

/** Port of ARIES-widget `WelcomeCards` — wrap layout, one expanded card, motion. */
export function WelcomeCards({ onTryPrompt }) {
  const [openCardId, setOpenCardId] = useState(null);

  const openCard = WELCOME_CARDS.find((card) => card.id === openCardId) ?? null;
  const collapsedCards = WELCOME_CARDS.filter((card) => card.id !== openCardId);

  return (
    <div className="flex w-full flex-col gap-1.5">
      <AnimatePresence initial={false} mode="popLayout">
        {openCard ? (
          <motion.div
            key={openCard.id}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={expandTransition}
            className="w-full overflow-hidden"
          >
            <ExpandedCard
              card={openCard}
              onClose={() => setOpenCardId(null)}
              onTryPrompt={onTryPrompt}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.div
        layout
        className="flex w-full flex-wrap content-start items-start gap-1.5"
        transition={expandTransition}
      >
        <AnimatePresence initial={false} mode="popLayout">
          {collapsedCards.map((card) => (
            <CollapsedCard
              key={card.id}
              card={card}
              onOpen={() => setOpenCardId(card.id)}
            />
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

/** Port of ARIES-widget `LimitationsBlock`. */
export function LimitationsBlock() {
  return (
    <div className="flex w-full flex-col gap-2.5 px-1 py-6">
      <p className="m-0 px-3 font-[Poppins,sans-serif] text-sm font-medium leading-[1.57] tracking-[0.1px] text-[#1f2937]">
        Before we get started...
      </p>
      <ul className="m-0 flex list-none flex-col p-0">
        {LIMITATIONS.map((item) => (
          <li key={item.id} className="flex items-center gap-2.5 rounded-md px-3 py-2">
            <img
              src={item.icon}
              alt=""
              aria-hidden="true"
              width={18}
              height={18}
              className="size-[18px] shrink-0"
              style={{ width: 18, height: 18, maxWidth: 'none' }}
            />
            <span className="font-[Poppins,sans-serif] text-sm font-normal leading-[1.43] tracking-[0.17px] text-[#666]">
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
