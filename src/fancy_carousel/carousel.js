import * as animation from "../fancy_carousel/animation";
import { Swiper } from "swiper";
import event_type from "../events/events_type";
import Swipe from "../events/swipe";
import Basic_block from "../blocks/basic_block";

class Carousel extends Basic_block {
  isAnimating = [false];
  swiper;
  reset_time = false;
  start_time = 0;
  hidden = false;
  pause = false;
  

  constructor(block, parent_observer, id) {
    super(block, parent_observer, id);
    this.events.new_event(new Swipe(block));

    this.create_swiper();
    this.carousel_events();
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

  show() {
    this.hidden = false;
    this.autoplay();
    this.reset_time = true;
  }

  hide() {
    this.hidden = true;
    this.swiper.slideToLoop(0, 0, false);
  }

  autoplay(time) {
    if (this.hidden || this.locked) {
      this.start_time = time;
      return;
    }

    if (this.pause) {
      this.start_time = time;
    }

    if (this.reset_time) {
      this.start_time = time;
      this.reset_time = false;
    }
    if(animation.checkAnimating(this.isAnimating)) {
      this.start_time = time
    }
    const elapsed = time - this.start_time;
    
    console.log(!this.swiper.isEnd);
    if (elapsed >= 2000 && !isNaN(elapsed) && !this.swiper.isEnd) {
      this.start_time = time;
      this.show_next_slide();
    }
    if(this.swiper.isEnd && elapsed >= 2000){
      this.start_time = time;
      this.pause = true;
      this.programatic_slide_hide(() => this.swiper.slideToLoop(0, 0, false));
  
    }
    this.update_nav(elapsed);
    requestAnimationFrame(this.autoplay.bind(this));
  }

  update_nav(elapsed) {
    if(animation.checkAnimating(this.isAnimating))return
    const nav_list = document.querySelectorAll(".lead-carousel__nav__item");
    const progress = nav_list[this.swiper.activeIndex].querySelector(".lead-carousel__nav__progress");
    const percent = (elapsed / 2000) * 100;
    if (percent >= 100) {
      return;
    }
    progress.style.width = `${percent}%`;
  }

  update_nav_shown() {
    const nav_list = document.querySelectorAll(".lead-carousel__nav__item");
    nav_list.forEach((nav_item, index) => {
      const progress = nav_item.querySelector(".lead-carousel__nav__progress");
      progress.style.width = "0";

      if (index >= this.swiper.activeIndex) return;
      progress.style.width = "100%";
    });
  }

  create_swiper() {
    this.swiper = new Swiper(this.block_node.querySelector(".lead_swiper"), {
      allowTouchMove: false,
      speed: 0,
      on: {
        reachBeginning: (e) => {
          if (e.activeIndex !== 0) return;

          animation.resetAnimElements(e, this);
          animation.playAnimation(animation.setupAnimation(e, e.activeIndex, this));
        },
      },
    });

    const nav = this.block_node.querySelector(".lead-carousel__nav");
    const nav_item = nav.querySelector(".lead-carousel__nav__item").cloneNode(true);
    nav.innerHTML = "";
    document.querySelectorAll(".swiper-slide").forEach(() => {
      nav.append(nav_item.cloneNode(true));
    });
  }

  update_elements_pos(e) {
    if (Math.abs(e.angle) < 45) return;
    if (animation.checkAnimating(this.isAnimating)) return;
    const diff = e.distance.x;

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
    const diff = e.distance.x;
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

  pointer_down(e) {
    if (Math.abs(e.angle) < 45) return;
    this.pause = true;
  }

  show_next_slide() {
    if (this.swiper.isEnd) return;
    this.pause = true;
    this.programatic_slide_hide(() => this.swiper.slideNext(0));
  }

  show_prev_slide() {
    if (this.swiper.activeIndex === 0) return;
    this.pause = true;
    this.programatic_slide_hide(() => this.swiper.slidePrev(0));
  }

  programatic_slide_hide(on_done) {
    const animeEl = animation.setupAnimation(this.swiper, this.swiper.activeIndex, this, "hide");
    animation.playAnimation(animeEl);

    animeEl.forEach((animation_obj) => {
      animation_obj.finished.then(() => {
        if (animation.checkAnimating(this.isAnimating)) return;
        on_done();
        this.resetAnimElementsPos();
      });
    });
  }

  pointer_leave() {
    if (animation.checkAnimating(this.isAnimating)) return;
    animation.playAnimation(animation.setupAnimation(this.swiper, this.swiper.activeIndex, this, "return"));
  }

  carousel_events() {
    this.swiper.on("slideChange", (e) => {
      animation.playAnimation(animation.setupAnimation(this.swiper, e.activeIndex, this));
    });
    this.events.add_listener(event_type.swipe_start, this.pointer_down.bind(this));

    this.events.add_listener(event_type.swiping, this.update_elements_pos.bind(this));
    this.events.add_listener(event_type.swipe_end, this.pointer_up.bind(this));

    this.block_node.querySelector(".lead-carousel__direction__left").addEventListener("click", () => {
      this.show_prev_slide();
    });

    this.block_node.querySelector(".lead-carousel__direction__right").addEventListener("click", () => {
      this.show_next_slide();
    });
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
    this.pause = false;
    this.update_nav_shown();

    const animation_elements = Object.values(animation.getAnimationElements(this.swiper, this.swiper.activeIndex, this));

    animation_elements.forEach((block) => {
      block.dataset.pos = "";
    });
  }
}

export default Carousel;
