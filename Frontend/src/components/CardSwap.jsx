import React, { Children, cloneElement, forwardRef, isValidElement, useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';
import './CardSwap.css';

export const Card = forwardRef(({ customClass, ...rest }, ref) => (
  <div ref={ref} {...rest} className={`card ${customClass ?? ''} ${rest.className ?? ''}`.trim()} />
));
Card.displayName = 'Card';

const makeSlot = (i, distX, distY, total) => ({
  x: i * distX,
  y: -i * distY,
  z: -i * distX * 1.5,
  zIndex: total - i
});
const placeNow = (el, slot, skew) =>
  gsap.set(el, {
    x: slot.x,
    y: slot.y,
    z: slot.z,
    xPercent: -53,
    yPercent: -100,
    skewY: skew,
    transformOrigin: 'center center',
    zIndex: slot.zIndex,
    force3D: true
  });

const CardSwap = ({
  width = 500,
  height = 300,
  cardDistance = 40,
  verticalDistance = 50,
  delay = 5000,
  pauseOnHover = false,
  onCardClick,
  skewAmount = 1,
  easing = 'elastic',
  children
}) => {
  const config =
    easing === 'elastic'
      ? {
        ease: 'power3.out',
        durDrop: 0.9,
        durMove: 0.7,
        durReturn: 0.8,
        promoteOverlap: 0.6,
        returnDelay: 0.05
      }
      : {
        ease: 'power2.inOut',
        durDrop: 0.6,
        durMove: 0.5,
        durReturn: 0.6,
        promoteOverlap: 0.4,
        returnDelay: 0.15
      };

  const childArr = useMemo(() => Children.toArray(children), [children]);
  const refs = useMemo(
    () => childArr.map(() => React.createRef()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [childArr.length]
  );

  const order = useRef(Array.from({ length: childArr.length }, (_, i) => i));

  const tlRef = useRef(null);
  const intervalRef = useRef();
  const container = useRef(null);

  useEffect(() => {
    const total = refs.length;
    order.current = Array.from({ length: total }, (_, i) => i);
    refs.forEach((r, i) => placeNow(r.current, makeSlot(i, cardDistance, verticalDistance, total), skewAmount));

    let scheduledCall = null;

    const swap = () => {
      if (order.current.length < 2) return;

      // Kill the previous timeline if it's still running to prevent overlap
      if (tlRef.current) {
        tlRef.current.kill();
      }

      const [front, ...rest] = order.current;
      const elFront = refs[front].current;
      const tl = gsap.timeline({
        onComplete: () => {
          // Schedule the NEXT swap only after this one finishes
          scheduledCall = gsap.delayedCall(delay / 1000, swap);
        }
      });
      tlRef.current = tl;

      tl.to(elFront, {
        y: '+=500',
        duration: config.durDrop,
        ease: config.ease
      });

      tl.addLabel('promote', `-=${config.durDrop * config.promoteOverlap}`);
      rest.forEach((idx, i) => {
        const el = refs[idx].current;
        const slot = makeSlot(i, cardDistance, verticalDistance, refs.length);
        tl.set(el, { zIndex: slot.zIndex }, 'promote');
        tl.to(
          el,
          {
            x: slot.x,
            y: slot.y,
            z: slot.z,
            duration: config.durMove,
            ease: config.ease
          },
          `promote+=${i * 0.1}`
        );
      });

      const backSlot = makeSlot(refs.length - 1, cardDistance, verticalDistance, refs.length);
      tl.addLabel('return', `promote+=${config.durMove * config.returnDelay}`);
      tl.call(
        () => {
          gsap.set(elFront, { zIndex: backSlot.zIndex });
        },
        undefined,
        'return'
      );
      tl.to(
        elFront,
        {
          x: backSlot.x,
          y: backSlot.y,
          z: backSlot.z,
          duration: config.durReturn,
          ease: config.ease
        },
        'return'
      );

      tl.call(() => {
        order.current = [...rest, front];
      });
    };

    // Start the first swap after initial delay
    scheduledCall = gsap.delayedCall(delay / 1000, swap);

    if (pauseOnHover) {
      const node = container.current;
      const pause = () => {
        tlRef.current?.pause();
        scheduledCall?.pause();
      };
      const resume = () => {
        tlRef.current?.play();
        scheduledCall?.play();
      };
      node.addEventListener('mouseenter', pause);
      node.addEventListener('mouseleave', resume);
      return () => {
        node.removeEventListener('mouseenter', pause);
        node.removeEventListener('mouseleave', resume);
        scheduledCall?.kill();
        tlRef.current?.kill();
      };
    }
    return () => {
      scheduledCall?.kill();
      tlRef.current?.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardDistance, verticalDistance, delay, pauseOnHover, skewAmount, easing]);

  const rendered = childArr.map((child, i) =>
    isValidElement(child)
      ? cloneElement(child, {
        key: i,
        ref: refs[i],
        style: { width, height, ...(child.props.style ?? {}) },
        onClick: e => {
          child.props.onClick?.(e);
          onCardClick?.(i);
        }
      })
      : child
  );

  return (
    <div ref={container} className="card-swap-container" style={{ width, height }}>
      {rendered}
    </div>
  );
};

export default CardSwap;
