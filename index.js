const options = {
    container: document.querySelector('.gallery'),
    card: '.card'
}

const modalClass = 'modal'
const modalImages = 'modal__images'
const modalImage = 'modal__image'
const modalOpening = 'modal__opening'
const modalOpened = 'modal__opened'

const summaryContainer = 'summary'
const summaryContent = 'summary__content'
const summaryTitle = 'summary__title'
const summaryDescription = 'summary__description'

const controlsContainer = 'controls'
const controlsClose = 'controls__close'
const controlsNav = 'controls__nav'
const controlsBtn = 'controls__btn'
const controlsBtnPrev = 'controls__btn_prev'
const controlsBtnNext = 'controls__btn_next'
const controlsCounter = 'controls__counter'

function fadeIn(element, callback) {
    animation()

    function animation() {
        let opacity = Number(element.style.opacity)
        if (opacity < 1) {
            opacity += .1
            element.style.opacity = opacity
            window.requestAnimationFrame(animation)
            return
        }

        if (callback) {
            callback()
        }
    }
}

function fadeOut(element, callback) {
    animation()

    function animation() {
        let opacity = Number(element.style.opacity)
        if (opacity > 0) {
            opacity -= .04
            element.style.opacity = opacity
            window.requestAnimationFrame(animation)
            return
        }

        if (callback) {
            callback()
        }
    }
}

class Gallery {
    constructor(options) {
        this.container = options.container
        this.cards = this.container.querySelectorAll(options.card)
        this.size = this.cards.length
    }

    initModal() {
        this.modalContainer = document.createElement('div')
        this.modalContainer.classList.add(modalClass)
        this.modalContainer.innerHTML = `
            <div class="${summaryContainer}">
                <div class="${summaryContent}">
                    <h2 class="${summaryTitle}"></h2>
                    <p class="${summaryDescription}"></p>
                </div>
            </div>

            <div class="${controlsContainer}">
                <div title="Use ESC" class="${controlsClose}"></div>
                <div class="${controlsNav}">
                       <button title="Use keyboard arrow" class="${controlsBtn} ${controlsBtnPrev}"></button>
                       <div class="${controlsCounter}">
                            1/${this.size}
                       </div>
                       <button title="Use keyboard arrow" class="${controlsBtn} ${controlsBtnNext}"></button>
                </div>
            </div>

            <div class="${modalImages}">
                ${Array.from(this.cards).map(item => `
                    <img src="${item.getAttribute('href')}" class="${modalImage}" />
                `).join('')}
            </div>
        `

        document.body.appendChild(this.modalContainer)

        this.modalImagesNode = this.modalContainer.querySelectorAll(`.${modalImage}`)
        this.controlsContainerNode = this.modalContainer.querySelector(`.${controlsContainer}`)
        this.controlsBtnPrevNode = this.modalContainer.querySelector(`.${controlsBtnPrev}`)
        this.controlsBtnNextNode = this.modalContainer.querySelector(`.${controlsBtnNext}`)
        this.controlsCounterNode = this.modalContainer.querySelector(`.${controlsCounter}`)
        this.summaryContainerNode = this.modalContainer.querySelector(`.${summaryContainer}`)
        this.summaryContentNode = this.modalContainer.querySelector(`.${summaryContent}`)
        this.summaryTitleNode = this.modalContainer.querySelector(`.${summaryTitle}`)
        this.summaryDescriptionNode = this.modalContainer.querySelector(`.${summaryDescription}`)
        this.controlsCloseNode = this.modalContainer.querySelector(`.${controlsClose}`)
    }

    events() {
        window.addEventListener('resize', this.resize)
        window.addEventListener('keyup', this.keyboardControls)
        this.container.addEventListener('click', this.activateModal)
        this.controlsContainerNode.addEventListener('click', this.switchImage)
        this.controlsCloseNode.addEventListener('click', this.closeGallary)
        this.swapImages()
    }

    swapImages = () => {
        let x = null
        let y = null
        let xMove = null
        let yMove = null

        this.modalContainer.addEventListener('touchstart', event => {
            x = event.changedTouches[0].clientX
            y = event.changedTouches[0].clientY
        })

        this.modalContainer.addEventListener('touchmove', event => {
            xMove = event.changedTouches[0].clientX - x
            yMove = event.changedTouches[0].clientY - y
        })

        this.modalContainer.addEventListener('touchend', event => {
            if (xMove > 100 && this.currentIndex > 0) {
                this.currentIndex -= 1
                this.switchChanges(true)
            } else if (xMove < -100 && this.currentIndex < this.size - 1) {
                this.currentIndex += 1
                this.switchChanges(true)
            }

            if (yMove > 200 || yMove < -200) {
                this.closeGallary()
            }

            xMove = null
            yMove = null
        })
    }

    resize = () => {
        if (this.modalContainer.classList.contains(modalOpened)) {
            this.setSizeImages()
            this.setCurrentState()
            this.setControlsPosition()
        }
    }

    keyboardControls = (event) => {
        if (!this.modalContainer.classList.contains(modalOpened)) return

        if (event.key === 'Escape' || event.keyCode === 27) {
            this.closeGallary()
        }

        if ((event.key === 'ArrowLeft' || event.keyCode === 37) && this.currentIndex > 0) {
            this.currentIndex -= 1
            this.switchChanges(true)
        }

        if ((event.key === 'ArrowRight' || event.keyCode === 39) && this.currentIndex < this.size - 1) {
            this.currentIndex += 1
            this.switchChanges(true)
        }
    }

    closeGallary = () => {
        this.setPositionImages()
        this.modalImagesNode.forEach(item => {
            item.style.opacity = 1
        })
        this.summaryContainerNode.style.width = 0
        this.controlsContainerNode.style.marginTop = window.innerWidth <= 375 ? '-100px' : '1000px'

        fadeOut(this.modalContainer, () => {
            this.modalContainer.classList.remove(modalOpened)
        })
    }

    switchImage = (event) => {
        event.preventDefault()
        const button = event.target.closest('button')

        if (!button) return

        if (button.classList.contains(controlsBtnPrev) && this.currentIndex > 0) {
            this.currentIndex -= 1
        }

        if (button.classList.contains(controlsBtnNext) && this.currentIndex < this.size - 1) {
            this.currentIndex += 1
        }

        this.switchChanges(true)
    }

    activateModal = (event) => {
        event.preventDefault()
        const cardNode = event.target.closest('a')

        if (
            !cardNode
            || this.modalContainer.classList.contains(modalOpening)
            || this.modalContainer.classList.contains(modalOpened)
        ) return

        this.currentIndex = Array.from(this.cards).findIndex(item => cardNode === item)
        this.modalContainer.classList.add(modalOpening)

        fadeIn(this.modalContainer, () => {
            this.modalContainer.classList.remove(modalOpening)
            this.modalContainer.classList.add(modalOpened)
            this.switchChanges()
        })

        this.setSizeImages()
        this.setPositionImages()
    }

    setSizeImages() {
        this.cards.forEach((item, ind) => {
            const data = item.getBoundingClientRect()
            this.modalImagesNode[ind].style.width = `${data.width}px`
            this.modalImagesNode[ind].style.height = `${data.height}px`
        })
    }

    setPositionImages() {
        this.cards.forEach((item, ind) => {
            const data = item.getBoundingClientRect()
            this.setPositionStyles(
                this.modalImagesNode[ind],
                data.left,
                data.top
            )
        })
    }

    setPositionStyles(element, x, y) {
        element.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`
    }

    setCurrentState() {
        this.prevImageHidden = []
        this.prevImageShowing = []
        this.activeImage = []
        this.nextImageShowing = []
        this.nextImageHidden = []

        this.modalImagesNode.forEach((item, ind) => {
            if (window.innerWidth <= 500) {
                if (ind + 1 < this.currentIndex) {
                    this.prevImageHidden.unshift(item)
                } else if (ind < this.currentIndex) {
                    this.prevImageShowing.unshift(item)
                } else if (ind === this.currentIndex) {
                    this.activeImage.push(item)
                } else if (ind > this.currentIndex + 1) {
                    this.nextImageHidden.push(item)
                } else if (ind > this.currentIndex) {
                    this.nextImageShowing.push(item)
                }
            } else {
                if (ind + 3 < this.currentIndex) {
                    this.prevImageHidden.unshift(item)
                } else if (ind < this.currentIndex) {
                    this.prevImageShowing.unshift(item)
                } else if (ind === this.currentIndex) {
                    this.activeImage.push(item)
                } else if (ind > this.currentIndex + 3) {
                    this.nextImageHidden.push(item)
                } else if (ind > this.currentIndex) {
                    this.nextImageShowing.push(item)
                }
            }

        })

        this.setGalleryStyles()
    }

    setGalleryStyles() {
        const imageWidth = this.cards[0].offsetWidth
        const imageHeight = this.cards[0].offsetHeight
        const modalWidth = window.innerWidth
        const modalHeight = window.innerHeight
        const top = (modalHeight - imageHeight) / 2
        const left = (modalWidth - imageWidth) / 2

        this.prevImageHidden.forEach(item => {
            this.setImagesStyle(item, {
                top,
                left: -imageWidth,
                opacity: 0,
                zIndex: 1,
                scale: .4
            })
        })

        this.setImagesStyle(this.prevImageShowing[0], {
            top,
            left: left - imageWidth,
            opacity: .6,
            scale: .75,
            zIndex: 4
        })

        this.setImagesStyle(this.prevImageShowing[1], {
            top,
            left: 0,
            opacity: .5,
            scale: .6,
            zIndex: 3
        })

        this.setImagesStyle(this.prevImageShowing[2], {
            top,
            left: -imageWidth / 2,
            opacity: .4,
            scale: .5,
            zIndex: 2
        })

        this.activeImage.forEach(item => {
            this.setImagesStyle(item, {
                top,
                left,
                opacity: 1,
                zIndex: 5,
                scale: window.innerWidth <= 500 ? 1 : 1.2
            })
        })

        this.setImagesStyle(this.nextImageShowing[0], {
            top,
            left: left + imageWidth,
            opacity: .6,
            scale: .75,
            zIndex: 4
        })

        this.setImagesStyle(this.nextImageShowing[1], {
            top,
            left: modalWidth - imageWidth,
            opacity: .5,
            scale: .6,
            zIndex: 3
        })

        this.setImagesStyle(this.nextImageShowing[2], {
            top,
            left: modalWidth - (imageWidth / 2),
            opacity: .4,
            scale: .5,
            zIndex: 2
        })

        this.nextImageHidden.forEach(item => {
            this.setImagesStyle(item, {
                top,
                left: modalWidth,
                opacity: 0,
                zIndex: 1,
                scale: .4
            })
        })

        this.setControlsPosition()
    }

    setImagesStyle(element, { top, left, opacity, zIndex, scale }) {
        if (!element) return

        element.style.transform = `translate3d(${left.toFixed(1)}px, ${top.toFixed(1)}px, 0) scale(${scale})`
        element.style.opacity = opacity
        element.style.zIndex = zIndex
    }

    setControlsPosition() {
        if (window.innerWidth <= 375) {
            this.setControlsStyles(this.controlsContainerNode, {
                marginTop: 0,
                height: 'fit-content'
            })

            this.summaryContainerNode.style.width = '100%'
        } else if (window.innerWidth <= 768) {
            this.setControlsStyles(this.controlsContainerNode, {
                marginTop: 10,
                height: 100
            })

            this.summaryContainerNode.style.width = '100%'
        } else {
            this.setControlsStyles(this.controlsContainerNode, {
                marginTop: (window.innerHeight - this.cards[0].offsetHeight * 1.2) / 2,
                height: (this.cards[0].offsetHeight / 100) * 120
            })

            this.summaryContainerNode.style.width = '50%'
        }
    }

    setControlsStyles(element, { marginTop, height }) {
        element.style.marginTop = `${marginTop}px`
        element.style.height = `${height}px`
    }

    switchDisabledNav() {
        if (this.currentIndex === 0 && !this.controlsBtnPrevNode.disabled) {
            this.controlsBtnPrevNode.disabled = true
        }

        if (this.currentIndex > 0 && this.controlsBtnPrevNode.disabled) {
            this.controlsBtnPrevNode.disabled = false
        }

        if (this.currentIndex === this.size - 1 && !this.controlsBtnNextNode.disabled) {
            this.controlsBtnNextNode.disabled = true
        }

        if (this.currentIndex < this.size - 1 && this.controlsBtnNextNode.disabled) {
            this.controlsBtnNextNode.disabled = false
        }
    }

    changeCounter() {
        this.controlsCounterNode.innerText = `${this.currentIndex + 1}/${this.size}`
    }

    changeSummary(summaryAnimation) {
        const content = this.cards[this.currentIndex].dataset
        if (summaryAnimation) {
            this.summaryContentNode.style.opacity = 0
            setTimeout(() => {
                this.summaryTitleNode.innerText = content.title
                this.summaryDescriptionNode.innerText = content.description
                this.summaryContentNode.style.opacity = 1
            }, 300)
        } else {
            this.summaryTitleNode.innerText = content.title
            this.summaryDescriptionNode.innerText = content.description
        }
    }

    switchChanges(summaryAnimation) {
        this.setCurrentState()
        this.switchDisabledNav()
        this.changeCounter()
        this.changeSummary(summaryAnimation)
    }
}

const gallery = new Gallery(options)

gallery.initModal()
gallery.events()