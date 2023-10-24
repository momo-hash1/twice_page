import anime from "animejs";

const getAnimationElements = (swiper, index, swiperAnim) => {
  const animEl = {};
  swiperAnim.el.forEach((el) => {
    animEl[el.name] = swiper.slides[index].querySelector(`.${el.class}`);
  });
  return animEl;
};

const setRelativeAnimation = (target, animeProps) => {
  target.style.transform = "";
  const animation = anime({ targets: target, duration: 250, autoplay: false, easing: "easeOutQuad", ...animeProps });
  return animation;
};

const checkAnimating = (animating) => animating.some((v) => v === true);

const blockDrag = (swiperAnim, elementsLength, animeEl) => {
  swiperAnim.isAnimating = Array(elementsLength).fill(true);

  Array(elementsLength)
    .fill("")
    .forEach((_, index) => {
      if (animeEl[index] === undefined) return;
      animeEl[index].finished.then(() => {
        swiperAnim.isAnimating[index] = false;
      });
    });
};

const setupAnimation = (swiper, currentIndex, swiperAnim, animationType = "appear") => {
  const elements = getAnimationElements(swiper, currentIndex, swiperAnim);
  const animeEl = swiperAnim.el.map((el) => {
    if (typeof el.animations[animationType] === "function") {
      const animation = el.animations[animationType](elements[el.name].dataset.pos);
      return setRelativeAnimation(elements[el.name], animation);
    } else {
      return setRelativeAnimation(elements[el.name], el.animations[animationType]);
    }
  });

  blockDrag(swiperAnim, Object.values(elements).length, animeEl);
  return animeEl;
};

const playAnimation = (animation) => {
  animation.forEach((el) => {
    el.play();
  });
};

const showAnimation = (swiperAnim, callback) => {
  const animeEl = setupAnimation(swiperAnim.swiper, swiperAnim.swiper.activeIndex, swiperAnim, "disappear");
  playAnimation(animeEl);
  Array(swiperAnim.el.length)
    .fill("")
    .forEach((_, index) => {
      if (animeEl[index] === undefined) return;
      animeEl[index].finished.then(() => {
        if (checkAnimating(swiperAnim.isAnimating)) return;
        callback();
      });
    });
};
const resetAnimElements = (_elements, swiperAnim) => {
  _elements.slides.forEach((_, index) => {
    const elements = Object.values(getAnimationElements(_elements, index, swiperAnim));

    elements.forEach((el) => {
      el.style.opacity = (0).toString();
      el.dataset.pos = null;
      el.style.transform = `translateY(0px)`;
    });
  });
};
export { playAnimation, blockDrag, setRelativeAnimation, setupAnimation, checkAnimating, getAnimationElements, showAnimation, resetAnimElements };
