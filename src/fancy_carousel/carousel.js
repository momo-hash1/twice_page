import * as animation from "../fancy_carousel/animation";
import { Swiper } from "swiper";
import { Autoplay } from "swiper/modules";
import Event_observer from "../events/event_observer";
import event_type from "../events/events_type";
import Swipe from "../events/swipe";
import Basic_block from "../blocks/basic_block";

class Carousel extends Basic_block {
  isAnimating = [false];
  swiper;

  constructor(block, parent_observer, id) {
    super(block, parent_observer, id);
    this.events.new_event(  new Swipe(block));

    this.create_swiper();
    this.thisEvents();

    // setInterval(() => {
    //   const anim_list = animation.setupAnimation(this.swiper, this.swiper.activeIndex, this, "hide");
    //   animation.playAnimation(anim_list);
    //   anim_list.forEach((anim) => {
    //     anim.finished.then(() => {
    //       if (animation.checkAnimating(this.isAnimating)) return;

    //       if (this.swiper.activeIndex >= this.swiper.slides.length - 1) {
    //         this.swiper.slideTo(0, 0);

    //         return;
    //       }
    //       this.swiper.slideNext(0, false);

    //       this.resetAnimElementsPos();
    //     });
    //   });
    // }, 4000);
  }

  el = [
    {
      name: "text",
      class: "lead-carousel__slide__text",
      animations: {
        appear: { translateX: [150, 0], opacity: 1 },
        hide: { translateX: [0, 150], opacity: 0 },
        disappear: (currentPos) => {
          return { translateX: [currentPos, 0], opacity: 0 };
        },
        return: (currentPos) => {
          return { translateX: [currentPos, 0], opacity: 1 };
        },
      },
    },
    {
      name: "title",
      class: "lead-carousel__slide__title",
      animations: {
        appear: { translateX: [-25, 0], opacity: 1 },
        hide: { translateX: [0, -25], opacity: 0 },
        disappear: (currentPos) => {
          return { translateX: [currentPos, 0], opacity: 0 };
        },
        return: (currentPos) => {
          return { translateX: [currentPos, 0], opacity: 1, easing: "easeOutCubic" };
        },
      },
    },
    {
      name: "image",
      class: "lead-carousel__slide__image",
      animations: {
        appear: { translateY: [50, 0], opacity: 1, easing: "easeOutQuad", duration: 500 },
        hide: { translateY: [0, 50], opacity: 0, easing: "easeOutQuad", duration: 500 },
        disappear: (currentPos) => {
          currentPos = Math.abs(currentPos);
          return { translateY: [currentPos, 0], opacity: 0 };
        },
        return: (currentPos) => {
          currentPos = Math.abs(currentPos);
          return { translateY: [currentPos, 0], opacity: 1 };
        },
      },
    },
  ];

  create_swiper() {
    this.swiper = new Swiper(this.block_node.querySelector(".lead_swiper"), {
      allowTouchMove: false,
      speed: 0,
      slideClass: "lead-carousel__slide",
      on: {
        reachBeginning: (e) => {
          animation.resetAnimElements(e, this);
          animation.playAnimation(animation.setupAnimation(e, e.activeIndex, this));
        },
      },
    });
  }

  update_elements_pos(e) {
    if (animation.checkAnimating(this.isAnimating)) return;
    const diff = e.distance;

    const percent = diff / window.innerWidth;

    const elements = animation.getAnimationElements(this.swiper, this.swiper.activeIndex, this);

    if (percent * 100 > 30) {
      this.setRelativeStyle(elements.text, percent - 20 / 100);
    } else if (percent * 100 < -30) {
      this.setRelativeStyle(elements.text, percent + 20 / 100);
    }
    this.setRelativeStyle(elements.title, percent);
    this.setRelativeStyle(elements.button, Math.abs(percent), "translateY", 1);
    this.setRelativeStyle(elements.image, Math.abs(percent), "translateY", 1);
  }

  pointer_up(e) {
    const diff = e.distance;
    if (animation.checkAnimating(this.isAnimating)) return;

    let percent = Math.abs((diff / window.innerWidth) * 100);

    if (percent < 30) {
      animation.playAnimation(animation.setupAnimation(this.swiper, this.swiper.activeIndex, this, "return"));
      this.resetAnimElementsPos();
      return;
    } else {
      if ((this.swiper.activeIndex === 0 && diff > 0) || (this.swiper.activeIndex === this.swiper.slides.length - 1 && diff < 0)) {
        animation.playAnimation(animation.setupAnimation(this.swiper, this.swiper.activeIndex, this, "return"));
        this.resetAnimElementsPos();
        return;
      }
      const animeEl = animation.setupAnimation(this.swiper, this.swiper.activeIndex, this, "disappear");
      animation.playAnimation(animeEl);

      animeEl.forEach((animation_obj) => {
        animation_obj.finished.then(() => {
          if (animation.checkAnimating(this.isAnimating)) return;

          if (diff > 0) {
            this.swiper.slidePrev(0);
          } else if (diff < 0) {
            this.swiper.slideNext(0);
          }
          this.resetAnimElementsPos();
        });
      });
    }
  }

  pointer_leave() {
    if (animation.checkAnimating(this.isAnimating)) return;
    animation.playAnimation(animation.setupAnimation(this.swiper, this.swiper.activeIndex, this, "return"));
  }

  thisEvents() {
    this.swiper.on("slideChange", () => {
      animation.playAnimation(animation.setupAnimation(this.swiper, this.swiper.activeIndex, this));
    });

    this.swiper.on("activeIndexChange", (e) => {
      this.swiper.slides.forEach((slide, index) => {
        if (index === e.activeIndex) {
          slide.style.display = "";
          return;
        }
        slide.style.display = "none";
      });
    });

    this.events.add_listener(event_type.swiping, this.update_elements_pos.bind(this));
    this.events.add_listener(event_type.swipe_end, this.pointer_up.bind(this));
  }

  setRelativeStyle(target, percent, translate = "translateX", opacity = 0.7) {
    if (target === undefined) return;
    target.style.transform = `${translate}(${150 * percent}px)`;
    target.dataset.pos = 150 * percent;
    if (Math.abs(percent * 100) > 25) {
      target.style.opacity = opacity - opacity * Math.abs(percent);
    }
  }

  resetAnimElementsPos() {
    const animation_elements = Object.values(animation.getAnimationElements(this.swiper, this.swiper.activeIndex, this));

    animation_elements.forEach((block) => {
      block.dataset.pos = "";
    });
  }
}

export default Carousel;
