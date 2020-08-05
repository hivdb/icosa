import {citationIdCompare} from '../citation-id-compare';

function addCitationId(idList, id) {
  if (idList.includes(id)) {
    return idList;
  }
  idList.push(id);
  return idList.sort(citationIdCompare);
}


export function editCitation({
  actionObj, citations,
  extraReferredCitationIds, displayCitationIds
}) {
  const {
    citeId,
    doi,
    author,
    year,
    section
  } = actionObj;
  const extraState = {};
  let existCitation = citations[citeId];
  let citationId, resultCiteId, sectionId = 0;

  const citationObjs = Object.values(citations);
  for (const cite of citationObjs) {
    if (cite.doi === doi) {
      citationId = cite.citationId;
      sectionId = Math.max(sectionId, cite.sectionId);
      // modify all same doi citaitons
      cite.author = author;
      cite.year = year;
      if (
        !existCitation &&
        cite.section.toLocaleLowerCase() === section.toLocaleLowerCase()
      ) {
        existCitation = cite;
      }
    }
  }
  if (existCitation) {
    citationId = existCitation.citationId;
    sectionId = existCitation.sectionId;
    resultCiteId = `${citationId}.${sectionId}`;
    existCitation.section = section;
  }
  else {
    if (citationId) {
      // citation exists but not section
      sectionId ++;
    }
    else {
      citationId = Math.max(
        ...citationObjs.map(({citationId}) => citationId)
      ) + 1;
      sectionId = 1;
    }

    // add citation
    resultCiteId = `${citationId}.${sectionId}`;
    citations[resultCiteId] = {
      citationId, sectionId, author, year, doi, section
    };
    extraState.citations = {...citations};
  }
  let newDisplayCitationIds = [resultCiteId];
  if (citeId) {
    newDisplayCitationIds = addCitationId(
      displayCitationIds, resultCiteId
    );
  }
  return {
    ...extraState,
    extraReferredCitationIds: addCitationId(
      extraReferredCitationIds, resultCiteId
    ),
    displayCitationIds: newDisplayCitationIds
  };
}
