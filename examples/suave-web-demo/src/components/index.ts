export function Logo(href: string, src: string, alt: string, className: string = "logo") {
    return `<a href="${href}" target="_blank">
        <img src="${src}" class="${className}" alt="${alt}" />
    </a>`
}
