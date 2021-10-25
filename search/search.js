let searchbar
let facetContainer

const facetMap = new Map()
facetMap.set("mime_type", "Filetype")
facetMap.set("category", "Category")

const searchResultTemplate = (data, highlighting) => {
    const language = data.language_facet_string[0]
    return `
    <a href="${data.link}">
        <h1>${data.title}</h1>
        <p>${highlighting.content}</p>
        <span class="date">${new Date(data.sort_date).toLocaleDateString(language)}</span> <span class="language">${language}</span>
    </a>
`
}

function submit(event) {
    event.preventDefault()
    if (searchbar.value) {
        document.getElementById("search-form").submit()
    }
}

window.onload = async () => {
    searchbar = document.getElementById("search-bar")
    fsss.attachAutocompleteWidget(searchbar)

    const queryString = window.location.search
    const urlParams = new URLSearchParams(queryString)
    const queryTerm = urlParams.get("query")
    const page = await search(queryTerm)

    if (page && page.facets) {
        // renderFacet(
        //     page.facets.find(facet => facet.name.includes("language")).setDisplayName("Sprache"),
        //     document.getElementById("facets-language")
        // )
        initFacetContainer(page)
        renderAllFacets(page, facetContainer)

    }
    renderSearchResults(page)
}

async function search(query) {
    try {
        return await fsss.search(query)
    } catch (error) {
        console.log(error)
    }
}
function initFacetContainer(page){
    facetContainer = document.getElementById("facets-names")
    facetContainer.innerHTML = ""
    const resetAllButton = document.createElement("button")
    resetAllButton.id = "reset-all-facets"
    resetAllButton.innerText = "Reset all facets"
    facetContainer.append(resetAllButton)
    resetAllButton.onclick = async () => {
        const resetPage = await page.resetFacets()
        initFacetContainer(resetPage)
        renderAllFacets(resetPage, facetContainer)
        renderSearchResults(resetPage)
    }

}

function renderSearchResults(page){
    const paginationWrapper = document.getElementsByClassName("pagination")[0]
    paginationWrapper.innerHTML = ""
    const pageRenderer = fsss.getPageRenderer(page)
    pageRenderer.searchResultTemplate.templateFunction = searchResultTemplate
    pageRenderer.renderPaginationToHTMLElement(paginationWrapper, 5)
    linkPagination(page)

    const searchResultWrapper = document.getElementsByClassName("search-results")[0]
    searchResultWrapper.innerHTML = ""
    pageRenderer.renderSearchResultsToHTMLElement(searchResultWrapper)
}

function handleDidYouMean(page, pageRenderer) {
    const element = document.getElementById("did-you-mean")
    if (page.didYouMean.length > 0) {
        pageRenderer.renderDidYouMeanToHTMLElement(element)
        element.style.display = "block";
    }
}

async function linkPagination(searchResultPage) {
    const pagination = document.getElementsByClassName("smart-search-pagination")[0]
    const paginationButtons = pagination.children

    for (let button of paginationButtons) {
        button.addEventListener("click",  async (event) => {
            const clickedButton = event.currentTarget
            const pageNumber = Number(clickedButton.getAttribute("smart-search-page-value") || "0")
            const page = await searchResultPage.getPage(pageNumber)
            renderSearchResults(page)
        })
    }
}

function renderFacet(facet, container) {
    console.log(facet)
    const headline = document.createElement("h3")
    headline.innerText = facet.name
    const button = document.createElement("button")
    button.id = `${facet.displayName}-reset`
    button.innerText = "Reset"
    container.append(headline)
    container.append(button)
    document.getElementById(facet.displayName + "-reset").addEventListener("click", () => {
        filter(facet, true)
    })
    facet.counts.forEach(count => {
        const div = document.createElement("div")
        div.innerHTML = `<input type="checkbox" name="${count.value}">
                        <label>${count.value} (${count.count})</label>`
        div.classList.add("facet-value")
        div.firstElementChild.addEventListener("input", () => filter(facet))
        if (facet.selectedValues) {
            if (facet.selectedValues.includes(count.value)) {
                div.firstElementChild.checked = true
            }
        }
        container.append(div)
    })
    container.append(getApplyFilterButton(facet))
}

async function filter(facet, reset) {
    let values = Array.from(document.getElementsByClassName("facet-value"))
        .map(element => element.firstElementChild)
        .filter(element => element.checked)
        .map(element => element.name)

    const startDateValue = document.getElementById("start-date").value
    const endDateValue = document.getElementById("end-date").value
    try {
        const startDate = startDateValue && new Date(startDateValue)
        const endDate = endDateValue && new Date(endDateValue)
        if(reset){
            values = []
        }
        let page;
        if(startDate && endDate){
            page = await facet.customFilter(values, {sortDate: "desc"}, {fq:`sort_date:[${startDate.toISOString()} TO ${endDate.toISOString()}]`})
        } else {
            page = await facet.filter(...values)
        }

        initFacetContainer(page)
        renderAllFacets(page, facetContainer)
        // Rerender Facets
        Array.from(document.getElementsByClassName("search-result")).forEach(el => el.remove())
        const pageRenderer = fsss.getPageRenderer(page)
        pageRenderer.searchResultTemplate.cssClasses.wrapper = ["search-result", "grid-center-cell"]
        renderSearchResults(page)
    } catch (error) {
        console.log(error)
    }
}

function getApplyFilterButton(facet){
    const applyFilterButton = document.createElement("button")
    applyFilterButton.onclick = () => filter(facet)
    applyFilterButton.innerHTML = "Apply filter"
    return applyFilterButton
}

function renderAllFacets(page, container){
    const dateFilterBox = document.getElementById("custom-date-filter")
    dateFilterBox.style.display = ""
    page.facets.forEach((facet) => {
        const facetToRender = facet.setDisplayName(facetMap.get(facet.name))
        renderFacet(facetToRender, container)
    })
}