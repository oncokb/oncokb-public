import * as request from "superagent";

type CallbackHandler = (err: any, res ? : request.Response) => void;
export type TreatmentDrug = {
    'priority': number

        'treatmentDrugId': TreatmentDrugId

};
export type Query = {
    'alteration': string

        'alterationType': string

        'consequence': string

        'entrezGeneId': number

        'hgvs': string

        'hugoSymbol': string

        'id': string

        'proteinEnd': number

        'proteinStart': number

        'svType': "DELETION" | "TRANSLOCATION" | "DUPLICATION" | "INSERTION" | "INVERSION" | "FUSION" | "UNKNOWN"

        'tumorType': string

        'type': string

};
export type MatchVariant = {
    'alteration': string

        'hugoSymbol': string

};
export type Article = {
    'abstract': string

        'authors': string

        'elocationId': string

        'issue': string

        'journal': string

        'link': string

        'pages': string

        'pmid': string

        'pubDate': string

        'reference': string

        'title': string

        'volume': string

};
export type Alteration = {
    'alteration': string

        'consequence': VariantConsequence

        'gene': Gene

        'name': string

        'proteinEnd': number

        'proteinStart': number

        'refResidues': string

        'variantResidues': string

};
export type DownloadAvailability = {
    'hasAllActionableVariants': boolean

        'hasAllAnnotatedVariants': boolean

        'hasAllCuratedGenes': boolean

        'hasCancerGeneList': boolean

        'hasReadme': boolean

        'hasSqlDump': boolean

        'version': string

};
export type MainNumber = {
    'alteration': number

        'drug': number

        'gene': number

        'level': Array < MainNumberLevel >

        'tumorType': number

};
export type CancerTypeCount = {
    'cancerType': string

        'count': number

};
export type VariantAnnotation = {
    'alleleExist': boolean

        'background': string

        'dataVersion': string

        'diagnosticImplications': Array < Implication >

        'diagnosticSummary': string

        'geneExist': boolean

        'geneSummary': string

        'highestDiagnosticImplicationLevel': "LEVEL_0" | "LEVEL_1" | "LEVEL_2" | "LEVEL_2A" | "LEVEL_2B" | "LEVEL_3A" | "LEVEL_3B" | "LEVEL_4" | "LEVEL_R1" | "LEVEL_R2" | "LEVEL_R3" | "LEVEL_Px1" | "LEVEL_Px2" | "LEVEL_Px3" | "LEVEL_Dx1" | "LEVEL_Dx2" | "LEVEL_Dx3" | "NO"

        'highestPrognosticImplicationLevel': "LEVEL_0" | "LEVEL_1" | "LEVEL_2" | "LEVEL_2A" | "LEVEL_2B" | "LEVEL_3A" | "LEVEL_3B" | "LEVEL_4" | "LEVEL_R1" | "LEVEL_R2" | "LEVEL_R3" | "LEVEL_Px1" | "LEVEL_Px2" | "LEVEL_Px3" | "LEVEL_Dx1" | "LEVEL_Dx2" | "LEVEL_Dx3" | "NO"

        'highestResistanceLevel': "LEVEL_0" | "LEVEL_1" | "LEVEL_2" | "LEVEL_2A" | "LEVEL_2B" | "LEVEL_3A" | "LEVEL_3B" | "LEVEL_4" | "LEVEL_R1" | "LEVEL_R2" | "LEVEL_R3" | "LEVEL_Px1" | "LEVEL_Px2" | "LEVEL_Px3" | "LEVEL_Dx1" | "LEVEL_Dx2" | "LEVEL_Dx3" | "NO"

        'highestSensitiveLevel': "LEVEL_0" | "LEVEL_1" | "LEVEL_2" | "LEVEL_2A" | "LEVEL_2B" | "LEVEL_3A" | "LEVEL_3B" | "LEVEL_4" | "LEVEL_R1" | "LEVEL_R2" | "LEVEL_R3" | "LEVEL_Px1" | "LEVEL_Px2" | "LEVEL_Px3" | "LEVEL_Dx1" | "LEVEL_Dx2" | "LEVEL_Dx3" | "NO"

        'hotspot': boolean

        'lastUpdate': string

        'mutationEffect': MutationEffectResp

        'oncogenic': string

        'otherSignificantResistanceLevels': Array < "LEVEL_0" | "LEVEL_1" | "LEVEL_2" | "LEVEL_2A" | "LEVEL_2B" | "LEVEL_3A" | "LEVEL_3B" | "LEVEL_4" | "LEVEL_R1" | "LEVEL_R2" | "LEVEL_R3" | "LEVEL_Px1" | "LEVEL_Px2" | "LEVEL_Px3" | "LEVEL_Dx1" | "LEVEL_Dx2" | "LEVEL_Dx3" | "NO" >

        'otherSignificantSensitiveLevels': Array < "LEVEL_0" | "LEVEL_1" | "LEVEL_2" | "LEVEL_2A" | "LEVEL_2B" | "LEVEL_3A" | "LEVEL_3B" | "LEVEL_4" | "LEVEL_R1" | "LEVEL_R2" | "LEVEL_R3" | "LEVEL_Px1" | "LEVEL_Px2" | "LEVEL_Px3" | "LEVEL_Dx1" | "LEVEL_Dx2" | "LEVEL_Dx3" | "NO" >

        'prognosticImplications': Array < Implication >

        'prognosticSummary': string

        'query': Query

        'treatments': Array < IndicatorQueryTreatment >

        'tumorTypeSummary': string

        'tumorTypes': Array < VariantAnnotationTumorType >

        'variantExist': boolean

        'variantSummary': string

        'vus': boolean

};
export type AnnotatedVariant = {
    'entrezGeneId': number

        'gene': string

        'isoform': string

        'mutationEffect': string

        'mutationEffectAbstracts': string

        'mutationEffectPmids': string

        'oncogenicity': string

        'proteinChange': string

        'refSeq': string

        'variant': string

};
export type Implication = {
    'alterations': Array < string >

        'description': string

        'levelOfEvidence': "LEVEL_0" | "LEVEL_1" | "LEVEL_2" | "LEVEL_2A" | "LEVEL_2B" | "LEVEL_3A" | "LEVEL_3B" | "LEVEL_4" | "LEVEL_R1" | "LEVEL_R2" | "LEVEL_R3" | "LEVEL_Px1" | "LEVEL_Px2" | "LEVEL_Px3" | "LEVEL_Dx1" | "LEVEL_Dx2" | "LEVEL_Dx3" | "NO"

        'tumorType': TumorType

};
export type NCITDrug = {
    'description': string

        'drugName': string

        'ncitCode': string

        'synonyms': Array < string >

};
export type MainNumberLevel = {
    'level': string

        'number': number

};
export type LevelNumber = {
    'genes': Array < Gene >

        'level': "LEVEL_0" | "LEVEL_1" | "LEVEL_2" | "LEVEL_2A" | "LEVEL_2B" | "LEVEL_3A" | "LEVEL_3B" | "LEVEL_4" | "LEVEL_R1" | "LEVEL_R2" | "LEVEL_R3" | "LEVEL_Px1" | "LEVEL_Px2" | "LEVEL_Px3" | "LEVEL_Dx1" | "LEVEL_Dx2" | "LEVEL_Dx3" | "NO"

};
export type Gene = {
    'curatedIsoform': string

        'curatedRefSeq': string

        'entrezGeneId': number

        'geneAliases': Array < string >

        'genesets': Array < Geneset >

        'hugoSymbol': string

        'name': string

        'oncogene': boolean

        'tsg': boolean

};
export type TumorType = {
    'children': {}

    'code': string

        'color': string

        'id': number

        'level': number

        'mainType': MainType

        'name': string

        'parent': string

        'tissue': string

        'tumorForm': "SOLID" | "LIQUID"

};
export type ClinicalVariant = {
    'cancerType': TumorType

        'drug': Array < string >

        'drugAbstracts': Array < ArticleAbstract >

        'drugPmids': Array < string >

        'level': string

        'oncogenic': string

        'variant': Alteration

};
export type PortalAlteration = {
    'alterationType': string

        'cancerStudy': string

        'cancerType': string

        'gene': Gene

        'proteinChange': string

        'proteinEndPosition': number

        'proteinStartPosition': number

        'sampleId': string

};
export type TreatmentDrugId = {
    'drug': Drug

};
export type MatchVariantResult = {
    'query': Query

        'result': Array < MatchVariant >

};
export type Evidence = {
    'additionalInfo': string

        'alterations': Array < Alteration >

        'articles': Array < Article >

        'cancerType': string

        'description': string

        'evidenceType': "GENE_SUMMARY" | "MUTATION_SUMMARY" | "TUMOR_TYPE_SUMMARY" | "GENE_TUMOR_TYPE_SUMMARY" | "PROGNOSTIC_SUMMARY" | "DIAGNOSTIC_SUMMARY" | "GENE_BACKGROUND" | "ONCOGENIC" | "MUTATION_EFFECT" | "VUS" | "PROGNOSTIC_IMPLICATION" | "DIAGNOSTIC_IMPLICATION" | "STANDARD_THERAPEUTIC_IMPLICATIONS_FOR_DRUG_SENSITIVITY" | "STANDARD_THERAPEUTIC_IMPLICATIONS_FOR_DRUG_RESISTANCE" | "INVESTIGATIONAL_THERAPEUTIC_IMPLICATIONS_DRUG_SENSITIVITY" | "INVESTIGATIONAL_THERAPEUTIC_IMPLICATIONS_DRUG_RESISTANCE"

        'gene': Gene

        'id': number

        'knownEffect': string

        'lastEdit': string

        'lastReview': string

        'levelOfEvidence': "LEVEL_0" | "LEVEL_1" | "LEVEL_2" | "LEVEL_2A" | "LEVEL_2B" | "LEVEL_3A" | "LEVEL_3B" | "LEVEL_4" | "LEVEL_R1" | "LEVEL_R2" | "LEVEL_R3" | "LEVEL_Px1" | "LEVEL_Px2" | "LEVEL_Px3" | "LEVEL_Dx1" | "LEVEL_Dx2" | "LEVEL_Dx3" | "NO"

        'liquidPropagationLevel': "LEVEL_0" | "LEVEL_1" | "LEVEL_2" | "LEVEL_2A" | "LEVEL_2B" | "LEVEL_3A" | "LEVEL_3B" | "LEVEL_4" | "LEVEL_R1" | "LEVEL_R2" | "LEVEL_R3" | "LEVEL_Px1" | "LEVEL_Px2" | "LEVEL_Px3" | "LEVEL_Dx1" | "LEVEL_Dx2" | "LEVEL_Dx3" | "NO"

        'oncoTreeType': TumorType

        'solidPropagationLevel': "LEVEL_0" | "LEVEL_1" | "LEVEL_2" | "LEVEL_2A" | "LEVEL_2B" | "LEVEL_3A" | "LEVEL_3B" | "LEVEL_4" | "LEVEL_R1" | "LEVEL_R2" | "LEVEL_R3" | "LEVEL_Px1" | "LEVEL_Px2" | "LEVEL_Px3" | "LEVEL_Dx1" | "LEVEL_Dx2" | "LEVEL_Dx3" | "NO"

        'subtype': string

        'treatments': Array < Treatment >

        'uuid': string

};
export type TypeaheadSearchResp = {
    'annotation': string

        'drug': Drug

        'gene': Gene

        'highestResistanceLevel': string

        'highestSensitiveLevel': string

        'link': string

        'oncogenicity': string

        'queryType': "GENE" | "VARIANT" | "DRUG" | "TEXT"

        'tumorTypes': Array < TumorType >

        'variantExist': boolean

        'variants': Array < Alteration >

        'vus': boolean

};
export type VariantAnnotationTumorType = {
    'evidences': Array < Evidence >

        'relevantTumorType': boolean

        'tumorType': TumorType

};
export type ArticleAbstract = {
    'abstract': string

        'link': string

};
export type Drug = {
    'drugName': string

        'ncitCode': string

        'synonyms': Array < string >

        'uuid': string

};
export type MatchVariantRequest = {
    'oncokbVariants': Array < MatchVariant >

        'queries': Array < Query >

};
export type MainType = {
    'id': number

        'name': string

        'tumorForm': "SOLID" | "LIQUID"

};
export type VariantConsequence = {
    'description': string

        'isGenerallyTruncating': boolean

        'term': string

};
export type GeneNumber = {
    'alteration': number

        'gene': Gene

        'highestResistanceLevel': string

        'highestSensitiveLevel': string

        'tumorType': number

};
export type IndicatorQueryTreatment = {
    'abstracts': Array < ArticleAbstract >

        'alterations': Array < string >

        'approvedIndications': Array < string >

        'description': string

        'drugs': Array < Drug >

        'level': "LEVEL_0" | "LEVEL_1" | "LEVEL_2" | "LEVEL_2A" | "LEVEL_2B" | "LEVEL_3A" | "LEVEL_3B" | "LEVEL_4" | "LEVEL_R1" | "LEVEL_R2" | "LEVEL_R3" | "LEVEL_Px1" | "LEVEL_Px2" | "LEVEL_Px3" | "LEVEL_Dx1" | "LEVEL_Dx2" | "LEVEL_Dx3" | "NO"

        'levelAssociatedCancerType': TumorType

        'pmids': Array < string >

};
export type Treatment = {
    'approvedIndications': Array < string >

        'drugs': Array < TreatmentDrug >

        'priority': number

};
export type MutationEffectResp = {
    'citations': Citations

        'description': string

        'knownEffect': string

};
export type BiologicalVariant = {
    'mutationEffect': string

        'mutationEffectAbstracts': Array < ArticleAbstract >

        'mutationEffectPmids': Array < string >

        'oncogenic': string

        'oncogenicAbstracts': Array < ArticleAbstract >

        'oncogenicPmids': Array < string >

        'variant': Alteration

};
export type Geneset = {
    'genes': Array < Gene >

        'id': number

        'name': string

        'uuid': string

};
export type Citations = {
    'abstracts': Array < ArticleAbstract >

        'pmids': Array < string >

};

/**
 * OncoKB, a comprehensive and curated precision oncology knowledge base, offers oncologists detailed, evidence-based information about individual somatic mutations and structural alterations present in patient tumors with the goal of supporting optimal treatment decisions.
 * @class OncoKbPrivateAPI
 * @param {(string)} [domainOrOptions] - The project domain.
 */
export default class OncoKbPrivateAPI {

    private domain: string = "";
    private errorHandlers: CallbackHandler[] = [];

    constructor(domain ? : string) {
        if (domain) {
            this.domain = domain;
        }
    }

    getDomain() {
        return this.domain;
    }

    addErrorHandler(handler: CallbackHandler) {
        this.errorHandlers.push(handler);
    }

    private request(method: string, url: string, body: any, headers: any, queryParameters: any, form: any, reject: CallbackHandler, resolve: CallbackHandler, errorHandlers: CallbackHandler[]) {
        let req = (new(request as any).Request(method, url) as request.Request)
            .query(queryParameters);
        Object.keys(headers).forEach(key => {
            req.set(key, headers[key]);
        });

        if (body) {
            req.send(body);
        }

        if (typeof(body) === 'object' && !(body.constructor.name === 'Buffer')) {
            req.set('Content-Type', 'application/json');
        }

        if (Object.keys(form).length > 0) {
            req.type('form');
            req.send(form);
        }

        req.end((error, response) => {
            if (error || !response.ok) {
                reject(error);
                errorHandlers.forEach(handler => handler(error));
            } else {
                resolve(response);
            }
        });
    }

    searchDrugGetUsingGETURL(parameters: {
        'query': string,
        'limit' ? : number,
        $queryParameters ? : any
    }): string {
        let queryParameters: any = {};
        let path = '/search/ncitDrugs';

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                var parameter = parameters.$queryParameters[parameterName];
                queryParameters[parameterName] = parameter;
            });
        }
        let keys = Object.keys(queryParameters);
        return this.domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    };

    /**
     * Find NCIT matches based on blur query. This is not for search OncoKB curated drugs. Please use drugs/lookup for that purpose.
     * @method
     * @name OncoKbPrivateAPI#searchDrugGetUsingGET
     * @param {} query - The search query, it could be drug name, NCIT code
     * @param {} limit - The limit of returned result.
     */
    searchDrugGetUsingGETWithHttpInfo(parameters: {
        'query': string,
        'limit' ? : number,
        $queryParameters ? : any,
        $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        const errorHandlers = this.errorHandlers;
        const request = this.request;
        let path = '/search/ncitDrugs';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise(function(resolve, reject) {
            headers['Accept'] = 'application/json';
            headers['Content-Type'] = 'application/json';

            if (parameters['query'] !== undefined) {
                body = parameters['query'];
            }

            if (parameters['query'] === undefined) {
                reject(new Error('Missing required  parameter: query'));
                return;
            }

            if (parameters['limit'] !== undefined) {
                body = parameters['limit'];
            }

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
            }

            request('GET', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);

        });
    };

    /**
     * Find NCIT matches based on blur query. This is not for search OncoKB curated drugs. Please use drugs/lookup for that purpose.
     * @method
     * @name OncoKbPrivateAPI#searchDrugGetUsingGET
     * @param {} query - The search query, it could be drug name, NCIT code
     * @param {} limit - The limit of returned result.
     */
    searchDrugGetUsingGET(parameters: {
            'query': string,
            'limit' ? : number,
            $queryParameters ? : any,
            $domain ? : string
        }): Promise < Array < NCITDrug >
        > {
            return this.searchDrugGetUsingGETWithHttpInfo(parameters).then(function(response: request.Response) {
                return response.body;
            });
        };
    searchTreatmentsGetUsingGETURL(parameters: {
        'gene': string,
        'level' ? : string,
        $queryParameters ? : any
    }): string {
        let queryParameters: any = {};
        let path = '/search/treatments';
        if (parameters['gene'] !== undefined) {
            queryParameters['gene'] = parameters['gene'];
        }

        if (parameters['level'] !== undefined) {
            queryParameters['level'] = parameters['level'];
        }

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                var parameter = parameters.$queryParameters[parameterName];
                queryParameters[parameterName] = parameter;
            });
        }
        let keys = Object.keys(queryParameters);
        return this.domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    };

    /**
     * Search to find treatments.
     * @method
     * @name OncoKbPrivateAPI#searchTreatmentsGetUsingGET
     * @param {string} gene - The search query, it could be hugoSymbol or entrezGeneId.
     * @param {string} level - The level of evidence.
     */
    searchTreatmentsGetUsingGETWithHttpInfo(parameters: {
        'gene': string,
        'level' ? : string,
        $queryParameters ? : any,
        $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        const errorHandlers = this.errorHandlers;
        const request = this.request;
        let path = '/search/treatments';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise(function(resolve, reject) {
            headers['Accept'] = 'application/json';
            headers['Content-Type'] = 'application/json';

            if (parameters['gene'] !== undefined) {
                queryParameters['gene'] = parameters['gene'];
            }

            if (parameters['gene'] === undefined) {
                reject(new Error('Missing required  parameter: gene'));
                return;
            }

            if (parameters['level'] !== undefined) {
                queryParameters['level'] = parameters['level'];
            }

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
            }

            request('GET', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);

        });
    };

    /**
     * Search to find treatments.
     * @method
     * @name OncoKbPrivateAPI#searchTreatmentsGetUsingGET
     * @param {string} gene - The search query, it could be hugoSymbol or entrezGeneId.
     * @param {string} level - The level of evidence.
     */
    searchTreatmentsGetUsingGET(parameters: {
            'gene': string,
            'level' ? : string,
            $queryParameters ? : any,
            $domain ? : string
        }): Promise < Array < Treatment >
        > {
            return this.searchTreatmentsGetUsingGETWithHttpInfo(parameters).then(function(response: request.Response) {
                return response.body;
            });
        };
    searchTypeAheadGetUsingGETURL(parameters: {
        'query': string,
        'limit' ? : number,
        $queryParameters ? : any
    }): string {
        let queryParameters: any = {};
        let path = '/search/typeahead';
        if (parameters['query'] !== undefined) {
            queryParameters['query'] = parameters['query'];
        }

        if (parameters['limit'] !== undefined) {
            queryParameters['limit'] = parameters['limit'];
        }

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                var parameter = parameters.$queryParameters[parameterName];
                queryParameters[parameterName] = parameter;
            });
        }
        let keys = Object.keys(queryParameters);
        return this.domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    };

    /**
     * Find matches based on blur query.
     * @method
     * @name OncoKbPrivateAPI#searchTypeAheadGetUsingGET
     * @param {string} query - The search query, it could be hugoSymbol, entrezGeneId or variant. At least two characters. Maximum two keywords are supported, separated by space
     * @param {integer} limit - The limit of returned result.
     */
    searchTypeAheadGetUsingGETWithHttpInfo(parameters: {
        'query': string,
        'limit' ? : number,
        $queryParameters ? : any,
        $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        const errorHandlers = this.errorHandlers;
        const request = this.request;
        let path = '/search/typeahead';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise(function(resolve, reject) {
            headers['Accept'] = 'application/json';
            headers['Content-Type'] = 'application/json';

            if (parameters['query'] !== undefined) {
                queryParameters['query'] = parameters['query'];
            }

            if (parameters['query'] === undefined) {
                reject(new Error('Missing required  parameter: query'));
                return;
            }

            if (parameters['limit'] !== undefined) {
                queryParameters['limit'] = parameters['limit'];
            }

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
            }

            request('GET', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);

        });
    };

    /**
     * Find matches based on blur query.
     * @method
     * @name OncoKbPrivateAPI#searchTypeAheadGetUsingGET
     * @param {string} query - The search query, it could be hugoSymbol, entrezGeneId or variant. At least two characters. Maximum two keywords are supported, separated by space
     * @param {integer} limit - The limit of returned result.
     */
    searchTypeAheadGetUsingGET(parameters: {
            'query': string,
            'limit' ? : number,
            $queryParameters ? : any,
            $domain ? : string
        }): Promise < Array < TypeaheadSearchResp >
        > {
            return this.searchTypeAheadGetUsingGETWithHttpInfo(parameters).then(function(response: request.Response) {
                return response.body;
            });
        };
    searchVariantsBiologicalGetUsingGETURL(parameters: {
        'hugoSymbol' ? : string,
        $queryParameters ? : any
    }): string {
        let queryParameters: any = {};
        let path = '/search/variants/biological';
        if (parameters['hugoSymbol'] !== undefined) {
            queryParameters['hugoSymbol'] = parameters['hugoSymbol'];
        }

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                var parameter = parameters.$queryParameters[parameterName];
                queryParameters[parameterName] = parameter;
            });
        }
        let keys = Object.keys(queryParameters);
        return this.domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    };

    /**
     * Get annotated variants information for specified gene.
     * @method
     * @name OncoKbPrivateAPI#searchVariantsBiologicalGetUsingGET
     * @param {string} hugoSymbol - hugoSymbol
     */
    searchVariantsBiologicalGetUsingGETWithHttpInfo(parameters: {
        'hugoSymbol' ? : string,
        $queryParameters ? : any,
            $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        const errorHandlers = this.errorHandlers;
        const request = this.request;
        let path = '/search/variants/biological';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise(function(resolve, reject) {
            headers['Accept'] = 'application/json';
            headers['Content-Type'] = 'application/json';

            if (parameters['hugoSymbol'] !== undefined) {
                queryParameters['hugoSymbol'] = parameters['hugoSymbol'];
            }

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
            }

            request('GET', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);

        });
    };

    /**
     * Get annotated variants information for specified gene.
     * @method
     * @name OncoKbPrivateAPI#searchVariantsBiologicalGetUsingGET
     * @param {string} hugoSymbol - hugoSymbol
     */
    searchVariantsBiologicalGetUsingGET(parameters: {
            'hugoSymbol' ? : string,
            $queryParameters ? : any,
                $domain ? : string
        }): Promise < Array < BiologicalVariant >
        > {
            return this.searchVariantsBiologicalGetUsingGETWithHttpInfo(parameters).then(function(response: request.Response) {
                return response.body;
            });
        };
    searchVariantsClinicalGetUsingGETURL(parameters: {
        'hugoSymbol' ? : string,
        $queryParameters ? : any
    }): string {
        let queryParameters: any = {};
        let path = '/search/variants/clinical';
        if (parameters['hugoSymbol'] !== undefined) {
            queryParameters['hugoSymbol'] = parameters['hugoSymbol'];
        }

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                var parameter = parameters.$queryParameters[parameterName];
                queryParameters[parameterName] = parameter;
            });
        }
        let keys = Object.keys(queryParameters);
        return this.domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    };

    /**
     * Get list of variant clinical information for specified gene.
     * @method
     * @name OncoKbPrivateAPI#searchVariantsClinicalGetUsingGET
     * @param {string} hugoSymbol - hugoSymbol
     */
    searchVariantsClinicalGetUsingGETWithHttpInfo(parameters: {
        'hugoSymbol' ? : string,
        $queryParameters ? : any,
            $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        const errorHandlers = this.errorHandlers;
        const request = this.request;
        let path = '/search/variants/clinical';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise(function(resolve, reject) {
            headers['Accept'] = 'application/json';
            headers['Content-Type'] = 'application/json';

            if (parameters['hugoSymbol'] !== undefined) {
                queryParameters['hugoSymbol'] = parameters['hugoSymbol'];
            }

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
            }

            request('GET', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);

        });
    };

    /**
     * Get list of variant clinical information for specified gene.
     * @method
     * @name OncoKbPrivateAPI#searchVariantsClinicalGetUsingGET
     * @param {string} hugoSymbol - hugoSymbol
     */
    searchVariantsClinicalGetUsingGET(parameters: {
            'hugoSymbol' ? : string,
            $queryParameters ? : any,
                $domain ? : string
        }): Promise < Array < ClinicalVariant >
        > {
            return this.searchVariantsClinicalGetUsingGETWithHttpInfo(parameters).then(function(response: request.Response) {
                return response.body;
            });
        };
    utilDataReleaseDownloadAvailabilityGetUsingGETURL(parameters: {
        $queryParameters ? : any
    }): string {
        let queryParameters: any = {};
        let path = '/utils/dataRelease/downloadAvailability';

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                var parameter = parameters.$queryParameters[parameterName];
                queryParameters[parameterName] = parameter;
            });
        }
        let keys = Object.keys(queryParameters);
        return this.domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    };

    /**
     * Get information about what files are available by data version
     * @method
     * @name OncoKbPrivateAPI#utilDataReleaseDownloadAvailabilityGetUsingGET
     */
    utilDataReleaseDownloadAvailabilityGetUsingGETWithHttpInfo(parameters: {
        $queryParameters ? : any,
            $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        const errorHandlers = this.errorHandlers;
        const request = this.request;
        let path = '/utils/dataRelease/downloadAvailability';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise(function(resolve, reject) {
            headers['Accept'] = 'application/json';
            headers['Content-Type'] = 'application/json';

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
            }

            request('GET', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);

        });
    };

    /**
     * Get information about what files are available by data version
     * @method
     * @name OncoKbPrivateAPI#utilDataReleaseDownloadAvailabilityGetUsingGET
     */
    utilDataReleaseDownloadAvailabilityGetUsingGET(parameters: {
            $queryParameters ? : any,
                $domain ? : string
        }): Promise < Array < DownloadAvailability >
        > {
            return this.utilDataReleaseDownloadAvailabilityGetUsingGETWithHttpInfo(parameters).then(function(response: request.Response) {
                return response.body;
            });
        };
    utilDataReleaseReadmeGetUsingGETURL(parameters: {
        'version' ? : string,
        $queryParameters ? : any
    }): string {
        let queryParameters: any = {};
        let path = '/utils/dataRelease/readme';
        if (parameters['version'] !== undefined) {
            queryParameters['version'] = parameters['version'];
        }

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                var parameter = parameters.$queryParameters[parameterName];
                queryParameters[parameterName] = parameter;
            });
        }
        let keys = Object.keys(queryParameters);
        return this.domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    };

    /**
     * Get readme info for specific data release version
     * @method
     * @name OncoKbPrivateAPI#utilDataReleaseReadmeGetUsingGET
     * @param {string} version - version
     */
    utilDataReleaseReadmeGetUsingGETWithHttpInfo(parameters: {
        'version' ? : string,
        $queryParameters ? : any,
            $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        const errorHandlers = this.errorHandlers;
        const request = this.request;
        let path = '/utils/dataRelease/readme';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise(function(resolve, reject) {
            headers['Accept'] = 'text/plain';
            headers['Content-Type'] = 'application/json';

            if (parameters['version'] !== undefined) {
                queryParameters['version'] = parameters['version'];
            }

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
            }

            request('GET', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);

        });
    };

    /**
     * Get readme info for specific data release version
     * @method
     * @name OncoKbPrivateAPI#utilDataReleaseReadmeGetUsingGET
     * @param {string} version - version
     */
    utilDataReleaseReadmeGetUsingGET(parameters: {
        'version' ? : string,
        $queryParameters ? : any,
            $domain ? : string
    }): Promise < string > {
        return this.utilDataReleaseReadmeGetUsingGETWithHttpInfo(parameters).then(function(response: request.Response) {
            return response.body;
        });
    };
    utilDataReleaseSqlDumpGetUsingGETURL(parameters: {
        'version' ? : string,
        $queryParameters ? : any
    }): string {
        let queryParameters: any = {};
        let path = '/utils/dataRelease/sqlDump';
        if (parameters['version'] !== undefined) {
            queryParameters['version'] = parameters['version'];
        }

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                var parameter = parameters.$queryParameters[parameterName];
                queryParameters[parameterName] = parameter;
            });
        }
        let keys = Object.keys(queryParameters);
        return this.domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    };

    /**
     * utilDataReleaseSqlDumpGet
     * @method
     * @name OncoKbPrivateAPI#utilDataReleaseSqlDumpGetUsingGET
     * @param {string} version - version
     */
    utilDataReleaseSqlDumpGetUsingGETWithHttpInfo(parameters: {
        'version' ? : string,
        $queryParameters ? : any,
            $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        const errorHandlers = this.errorHandlers;
        const request = this.request;
        let path = '/utils/dataRelease/sqlDump';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise(function(resolve, reject) {
            headers['Accept'] = 'application/zip';
            headers['Content-Type'] = 'application/json';

            if (parameters['version'] !== undefined) {
                queryParameters['version'] = parameters['version'];
            }

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
            }

            request('GET', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);

        });
    };

    /**
     * utilDataReleaseSqlDumpGet
     * @method
     * @name OncoKbPrivateAPI#utilDataReleaseSqlDumpGetUsingGET
     * @param {string} version - version
     */
    utilDataReleaseSqlDumpGetUsingGET(parameters: {
            'version' ? : string,
            $queryParameters ? : any,
                $domain ? : string
        }): Promise < Array < string >
        > {
            return this.utilDataReleaseSqlDumpGetUsingGETWithHttpInfo(parameters).then(function(response: request.Response) {
                return response.body;
            });
        };
    utilsEvidencesByLevelsGetUsingGETURL(parameters: {
        $queryParameters ? : any
    }): string {
        let queryParameters: any = {};
        let path = '/utils/evidences/levels';

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                var parameter = parameters.$queryParameters[parameterName];
                queryParameters[parameterName] = parameter;
            });
        }
        let keys = Object.keys(queryParameters);
        return this.domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    };

    /**
     * Get the list of evidences by levels.
     * @method
     * @name OncoKbPrivateAPI#utilsEvidencesByLevelsGetUsingGET
     */
    utilsEvidencesByLevelsGetUsingGETWithHttpInfo(parameters: {
        $queryParameters ? : any,
            $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        const errorHandlers = this.errorHandlers;
        const request = this.request;
        let path = '/utils/evidences/levels';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise(function(resolve, reject) {
            headers['Accept'] = 'application/json';
            headers['Content-Type'] = 'application/json';

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
            }

            request('GET', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);

        });
    };

    /**
     * Get the list of evidences by levels.
     * @method
     * @name OncoKbPrivateAPI#utilsEvidencesByLevelsGetUsingGET
     */
    utilsEvidencesByLevelsGetUsingGET(parameters: {
        $queryParameters ? : any,
            $domain ? : string
    }): Promise < {} > {
        return this.utilsEvidencesByLevelsGetUsingGETWithHttpInfo(parameters).then(function(response: request.Response) {
            return response.body;
        });
    };
    utilsHotspotMutationGetUsingGETURL(parameters: {
        'hugoSymbol' ? : string,
        'variant' ? : string,
        $queryParameters ? : any
    }): string {
        let queryParameters: any = {};
        let path = '/utils/isHotspot';
        if (parameters['hugoSymbol'] !== undefined) {
            queryParameters['hugoSymbol'] = parameters['hugoSymbol'];
        }

        if (parameters['variant'] !== undefined) {
            queryParameters['variant'] = parameters['variant'];
        }

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                var parameter = parameters.$queryParameters[parameterName];
                queryParameters[parameterName] = parameter;
            });
        }
        let keys = Object.keys(queryParameters);
        return this.domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    };

    /**
     * Determine whether variant is hotspot mutation.
     * @method
     * @name OncoKbPrivateAPI#utilsHotspotMutationGetUsingGET
     * @param {string} hugoSymbol - Gene hugo symbol
     * @param {string} variant - Variant name
     */
    utilsHotspotMutationGetUsingGETWithHttpInfo(parameters: {
        'hugoSymbol' ? : string,
        'variant' ? : string,
        $queryParameters ? : any,
            $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        const errorHandlers = this.errorHandlers;
        const request = this.request;
        let path = '/utils/isHotspot';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise(function(resolve, reject) {
            headers['Accept'] = 'application/json';
            headers['Content-Type'] = 'application/json';

            if (parameters['hugoSymbol'] !== undefined) {
                queryParameters['hugoSymbol'] = parameters['hugoSymbol'];
            }

            if (parameters['variant'] !== undefined) {
                queryParameters['variant'] = parameters['variant'];
            }

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
            }

            request('GET', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);

        });
    };

    /**
     * Determine whether variant is hotspot mutation.
     * @method
     * @name OncoKbPrivateAPI#utilsHotspotMutationGetUsingGET
     * @param {string} hugoSymbol - Gene hugo symbol
     * @param {string} variant - Variant name
     */
    utilsHotspotMutationGetUsingGET(parameters: {
        'hugoSymbol' ? : string,
        'variant' ? : string,
        $queryParameters ? : any,
            $domain ? : string
    }): Promise < boolean > {
        return this.utilsHotspotMutationGetUsingGETWithHttpInfo(parameters).then(function(response: request.Response) {
            return response.body;
        });
    };
    validateVariantExampleGetUsingGETURL(parameters: {
        'hugoSymbol' ? : string,
        'variant' ? : string,
        'examples' ? : string,
        $queryParameters ? : any
    }): string {
        let queryParameters: any = {};
        let path = '/utils/match/variant';

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                var parameter = parameters.$queryParameters[parameterName];
                queryParameters[parameterName] = parameter;
            });
        }
        let keys = Object.keys(queryParameters);
        return this.domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    };

    /**
     * Check if the genomic example will be mapped to OncoKB variant.
     * @method
     * @name OncoKbPrivateAPI#validateVariantExampleGetUsingGET
     * @param {} hugoSymbol - Gene Hugo Symbol
     * @param {} variant - The OncoKB variant
     * @param {} examples - The genomic examples.
     */
    validateVariantExampleGetUsingGETWithHttpInfo(parameters: {
        'hugoSymbol' ? : string,
        'variant' ? : string,
        'examples' ? : string,
        $queryParameters ? : any,
            $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        const errorHandlers = this.errorHandlers;
        const request = this.request;
        let path = '/utils/match/variant';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise(function(resolve, reject) {
            headers['Accept'] = 'application/json';
            headers['Content-Type'] = 'application/json';

            if (parameters['hugoSymbol'] !== undefined) {
                body = parameters['hugoSymbol'];
            }

            if (parameters['variant'] !== undefined) {
                body = parameters['variant'];
            }

            if (parameters['examples'] !== undefined) {
                body = parameters['examples'];
            }

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
            }

            request('GET', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);

        });
    };

    /**
     * Check if the genomic example will be mapped to OncoKB variant.
     * @method
     * @name OncoKbPrivateAPI#validateVariantExampleGetUsingGET
     * @param {} hugoSymbol - Gene Hugo Symbol
     * @param {} variant - The OncoKB variant
     * @param {} examples - The genomic examples.
     */
    validateVariantExampleGetUsingGET(parameters: {
        'hugoSymbol' ? : string,
        'variant' ? : string,
        'examples' ? : string,
        $queryParameters ? : any,
            $domain ? : string
    }): Promise < {} > {
        return this.validateVariantExampleGetUsingGETWithHttpInfo(parameters).then(function(response: request.Response) {
            return response.body;
        });
    };
    validateVariantExamplePostUsingPOSTURL(parameters: {
        'body': MatchVariantRequest,
        $queryParameters ? : any
    }): string {
        let queryParameters: any = {};
        let path = '/utils/match/variant';

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                var parameter = parameters.$queryParameters[parameterName];
                queryParameters[parameterName] = parameter;
            });
        }
        let keys = Object.keys(queryParameters);
        return this.domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    };

    /**
     * Check which OncoKB variants can be mapped on genomic examples.
     * @method
     * @name OncoKbPrivateAPI#validateVariantExamplePostUsingPOST
     * @param {} body - List of queries. Please see swagger.json for request body format.
     */
    validateVariantExamplePostUsingPOSTWithHttpInfo(parameters: {
        'body': MatchVariantRequest,
        $queryParameters ? : any,
        $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        const errorHandlers = this.errorHandlers;
        const request = this.request;
        let path = '/utils/match/variant';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise(function(resolve, reject) {
            headers['Accept'] = 'application/json';
            headers['Content-Type'] = 'application/json';

            if (parameters['body'] !== undefined) {
                body = parameters['body'];
            }

            if (parameters['body'] === undefined) {
                reject(new Error('Missing required  parameter: body'));
                return;
            }

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
            }

            request('POST', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);

        });
    };

    /**
     * Check which OncoKB variants can be mapped on genomic examples.
     * @method
     * @name OncoKbPrivateAPI#validateVariantExamplePostUsingPOST
     * @param {} body - List of queries. Please see swagger.json for request body format.
     */
    validateVariantExamplePostUsingPOST(parameters: {
            'body': MatchVariantRequest,
            $queryParameters ? : any,
            $domain ? : string
        }): Promise < Array < MatchVariantResult >
        > {
            return this.validateVariantExamplePostUsingPOSTWithHttpInfo(parameters).then(function(response: request.Response) {
                return response.body;
            });
        };
    utilMutationMapperDataGetUsingGETURL(parameters: {
        'hugoSymbol' ? : string,
        $queryParameters ? : any
    }): string {
        let queryParameters: any = {};
        let path = '/utils/mutationMapperData';
        if (parameters['hugoSymbol'] !== undefined) {
            queryParameters['hugoSymbol'] = parameters['hugoSymbol'];
        }

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                var parameter = parameters.$queryParameters[parameterName];
                queryParameters[parameterName] = parameter;
            });
        }
        let keys = Object.keys(queryParameters);
        return this.domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    };

    /**
     * utilMutationMapperDataGet
     * @method
     * @name OncoKbPrivateAPI#utilMutationMapperDataGetUsingGET
     * @param {string} hugoSymbol - hugoSymbol
     */
    utilMutationMapperDataGetUsingGETWithHttpInfo(parameters: {
        'hugoSymbol' ? : string,
        $queryParameters ? : any,
            $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        const errorHandlers = this.errorHandlers;
        const request = this.request;
        let path = '/utils/mutationMapperData';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise(function(resolve, reject) {
            headers['Accept'] = 'application/json';
            headers['Content-Type'] = 'application/json';

            if (parameters['hugoSymbol'] !== undefined) {
                queryParameters['hugoSymbol'] = parameters['hugoSymbol'];
            }

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
            }

            request('GET', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);

        });
    };

    /**
     * utilMutationMapperDataGet
     * @method
     * @name OncoKbPrivateAPI#utilMutationMapperDataGetUsingGET
     * @param {string} hugoSymbol - hugoSymbol
     */
    utilMutationMapperDataGetUsingGET(parameters: {
            'hugoSymbol' ? : string,
            $queryParameters ? : any,
                $domain ? : string
        }): Promise < Array < PortalAlteration >
        > {
            return this.utilMutationMapperDataGetUsingGETWithHttpInfo(parameters).then(function(response: request.Response) {
                return response.body;
            });
        };
    utilsNumbersGeneGetUsingGETURL(parameters: {
        'hugoSymbol': string,
        $queryParameters ? : any
    }): string {
        let queryParameters: any = {};
        let path = '/utils/numbers/gene/{hugoSymbol}';

        path = path.replace('{hugoSymbol}', parameters['hugoSymbol'] + '');

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                var parameter = parameters.$queryParameters[parameterName];
                queryParameters[parameterName] = parameter;
            });
        }
        let keys = Object.keys(queryParameters);
        return this.domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    };

    /**
     * Get gene related numbers
     * @method
     * @name OncoKbPrivateAPI#utilsNumbersGeneGetUsingGET
     * @param {string} hugoSymbol - The gene symbol used in Human Genome Organisation.
     */
    utilsNumbersGeneGetUsingGETWithHttpInfo(parameters: {
        'hugoSymbol': string,
        $queryParameters ? : any,
        $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        const errorHandlers = this.errorHandlers;
        const request = this.request;
        let path = '/utils/numbers/gene/{hugoSymbol}';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise(function(resolve, reject) {
            headers['Accept'] = 'application/json';
            headers['Content-Type'] = 'application/json';

            path = path.replace('{hugoSymbol}', parameters['hugoSymbol'] + '');

            if (parameters['hugoSymbol'] === undefined) {
                reject(new Error('Missing required  parameter: hugoSymbol'));
                return;
            }

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
            }

            request('GET', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);

        });
    };

    /**
     * Get gene related numbers
     * @method
     * @name OncoKbPrivateAPI#utilsNumbersGeneGetUsingGET
     * @param {string} hugoSymbol - The gene symbol used in Human Genome Organisation.
     */
    utilsNumbersGeneGetUsingGET(parameters: {
        'hugoSymbol': string,
        $queryParameters ? : any,
        $domain ? : string
    }): Promise < GeneNumber > {
        return this.utilsNumbersGeneGetUsingGETWithHttpInfo(parameters).then(function(response: request.Response) {
            return response.body;
        });
    };
    utilsNumbersGenesGetUsingGETURL(parameters: {
        $queryParameters ? : any
    }): string {
        let queryParameters: any = {};
        let path = '/utils/numbers/genes/';

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                var parameter = parameters.$queryParameters[parameterName];
                queryParameters[parameterName] = parameter;
            });
        }
        let keys = Object.keys(queryParameters);
        return this.domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    };

    /**
     * Get gene related numbers of all genes. This is for main page word cloud.
     * @method
     * @name OncoKbPrivateAPI#utilsNumbersGenesGetUsingGET
     */
    utilsNumbersGenesGetUsingGETWithHttpInfo(parameters: {
        $queryParameters ? : any,
            $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        const errorHandlers = this.errorHandlers;
        const request = this.request;
        let path = '/utils/numbers/genes/';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise(function(resolve, reject) {
            headers['Accept'] = 'application/json';
            headers['Content-Type'] = 'application/json';

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
            }

            request('GET', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);

        });
    };

    /**
     * Get gene related numbers of all genes. This is for main page word cloud.
     * @method
     * @name OncoKbPrivateAPI#utilsNumbersGenesGetUsingGET
     */
    utilsNumbersGenesGetUsingGET(parameters: {
            $queryParameters ? : any,
                $domain ? : string
        }): Promise < Array < GeneNumber >
        > {
            return this.utilsNumbersGenesGetUsingGETWithHttpInfo(parameters).then(function(response: request.Response) {
                return response.body;
            });
        };
    utilsNumbersLevelsGetUsingGETURL(parameters: {
        $queryParameters ? : any
    }): string {
        let queryParameters: any = {};
        let path = '/utils/numbers/levels/';

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                var parameter = parameters.$queryParameters[parameterName];
                queryParameters[parameterName] = parameter;
            });
        }
        let keys = Object.keys(queryParameters);
        return this.domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    };

    /**
     * Get gene related numbers of all genes. This is for main page word cloud.
     * @method
     * @name OncoKbPrivateAPI#utilsNumbersLevelsGetUsingGET
     */
    utilsNumbersLevelsGetUsingGETWithHttpInfo(parameters: {
        $queryParameters ? : any,
            $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        const errorHandlers = this.errorHandlers;
        const request = this.request;
        let path = '/utils/numbers/levels/';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise(function(resolve, reject) {
            headers['Accept'] = 'application/json';
            headers['Content-Type'] = 'application/json';

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
            }

            request('GET', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);

        });
    };

    /**
     * Get gene related numbers of all genes. This is for main page word cloud.
     * @method
     * @name OncoKbPrivateAPI#utilsNumbersLevelsGetUsingGET
     */
    utilsNumbersLevelsGetUsingGET(parameters: {
            $queryParameters ? : any,
                $domain ? : string
        }): Promise < Array < LevelNumber >
        > {
            return this.utilsNumbersLevelsGetUsingGETWithHttpInfo(parameters).then(function(response: request.Response) {
                return response.body;
            });
        };
    utilsNumbersMainGetUsingGETURL(parameters: {
        $queryParameters ? : any
    }): string {
        let queryParameters: any = {};
        let path = '/utils/numbers/main/';

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                var parameter = parameters.$queryParameters[parameterName];
                queryParameters[parameterName] = parameter;
            });
        }
        let keys = Object.keys(queryParameters);
        return this.domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    };

    /**
     * Get numbers served for the main page dashboard.
     * @method
     * @name OncoKbPrivateAPI#utilsNumbersMainGetUsingGET
     */
    utilsNumbersMainGetUsingGETWithHttpInfo(parameters: {
        $queryParameters ? : any,
            $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        const errorHandlers = this.errorHandlers;
        const request = this.request;
        let path = '/utils/numbers/main/';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise(function(resolve, reject) {
            headers['Accept'] = 'application/json';
            headers['Content-Type'] = 'application/json';

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
            }

            request('GET', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);

        });
    };

    /**
     * Get numbers served for the main page dashboard.
     * @method
     * @name OncoKbPrivateAPI#utilsNumbersMainGetUsingGET
     */
    utilsNumbersMainGetUsingGET(parameters: {
        $queryParameters ? : any,
            $domain ? : string
    }): Promise < MainNumber > {
        return this.utilsNumbersMainGetUsingGETWithHttpInfo(parameters).then(function(response: request.Response) {
            return response.body;
        });
    };
    utilsOncoTreeMainTypesGetUsingGETURL(parameters: {
        'excludeSpecialTumorType' ? : boolean,
        $queryParameters ? : any
    }): string {
        let queryParameters: any = {};
        let path = '/utils/oncotree/mainTypes';
        if (parameters['excludeSpecialTumorType'] !== undefined) {
            queryParameters['excludeSpecialTumorType'] = parameters['excludeSpecialTumorType'];
        }

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                var parameter = parameters.$queryParameters[parameterName];
                queryParameters[parameterName] = parameter;
            });
        }
        let keys = Object.keys(queryParameters);
        return this.domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    };

    /**
     * Get the full list of OncoTree Maintype.
     * @method
     * @name OncoKbPrivateAPI#utilsOncoTreeMainTypesGetUsingGET
     * @param {boolean} excludeSpecialTumorType - Exclude special general tumor type
     */
    utilsOncoTreeMainTypesGetUsingGETWithHttpInfo(parameters: {
        'excludeSpecialTumorType' ? : boolean,
        $queryParameters ? : any,
            $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        const errorHandlers = this.errorHandlers;
        const request = this.request;
        let path = '/utils/oncotree/mainTypes';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise(function(resolve, reject) {
            headers['Accept'] = 'application/json';
            headers['Content-Type'] = 'application/json';

            if (parameters['excludeSpecialTumorType'] !== undefined) {
                queryParameters['excludeSpecialTumorType'] = parameters['excludeSpecialTumorType'];
            }

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
            }

            request('GET', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);

        });
    };

    /**
     * Get the full list of OncoTree Maintype.
     * @method
     * @name OncoKbPrivateAPI#utilsOncoTreeMainTypesGetUsingGET
     * @param {boolean} excludeSpecialTumorType - Exclude special general tumor type
     */
    utilsOncoTreeMainTypesGetUsingGET(parameters: {
            'excludeSpecialTumorType' ? : boolean,
            $queryParameters ? : any,
                $domain ? : string
        }): Promise < Array < MainType >
        > {
            return this.utilsOncoTreeMainTypesGetUsingGETWithHttpInfo(parameters).then(function(response: request.Response) {
                return response.body;
            });
        };
    utilsOncoTreeSubtypesGetUsingGETURL(parameters: {
        $queryParameters ? : any
    }): string {
        let queryParameters: any = {};
        let path = '/utils/oncotree/subtypes';

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                var parameter = parameters.$queryParameters[parameterName];
                queryParameters[parameterName] = parameter;
            });
        }
        let keys = Object.keys(queryParameters);
        return this.domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    };

    /**
     * Get the full list of OncoTree Subtypes.
     * @method
     * @name OncoKbPrivateAPI#utilsOncoTreeSubtypesGetUsingGET
     */
    utilsOncoTreeSubtypesGetUsingGETWithHttpInfo(parameters: {
        $queryParameters ? : any,
            $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        const errorHandlers = this.errorHandlers;
        const request = this.request;
        let path = '/utils/oncotree/subtypes';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise(function(resolve, reject) {
            headers['Accept'] = 'application/json';
            headers['Content-Type'] = 'application/json';

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
            }

            request('GET', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);

        });
    };

    /**
     * Get the full list of OncoTree Subtypes.
     * @method
     * @name OncoKbPrivateAPI#utilsOncoTreeSubtypesGetUsingGET
     */
    utilsOncoTreeSubtypesGetUsingGET(parameters: {
            $queryParameters ? : any,
                $domain ? : string
        }): Promise < Array < TumorType >
        > {
            return this.utilsOncoTreeSubtypesGetUsingGETWithHttpInfo(parameters).then(function(response: request.Response) {
                return response.body;
            });
        };
    utilPortalAlterationSampleCountGetUsingGETURL(parameters: {
        'hugoSymbol' ? : string,
        $queryParameters ? : any
    }): string {
        let queryParameters: any = {};
        let path = '/utils/portalAlterationSampleCount';
        if (parameters['hugoSymbol'] !== undefined) {
            queryParameters['hugoSymbol'] = parameters['hugoSymbol'];
        }

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                var parameter = parameters.$queryParameters[parameterName];
                queryParameters[parameterName] = parameter;
            });
        }
        let keys = Object.keys(queryParameters);
        return this.domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    };

    /**
     * utilPortalAlterationSampleCountGet
     * @method
     * @name OncoKbPrivateAPI#utilPortalAlterationSampleCountGetUsingGET
     * @param {string} hugoSymbol - hugoSymbol
     */
    utilPortalAlterationSampleCountGetUsingGETWithHttpInfo(parameters: {
        'hugoSymbol' ? : string,
        $queryParameters ? : any,
            $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        const errorHandlers = this.errorHandlers;
        const request = this.request;
        let path = '/utils/portalAlterationSampleCount';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise(function(resolve, reject) {
            headers['Accept'] = 'application/json';
            headers['Content-Type'] = 'application/json';

            if (parameters['hugoSymbol'] !== undefined) {
                queryParameters['hugoSymbol'] = parameters['hugoSymbol'];
            }

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
            }

            request('GET', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);

        });
    };

    /**
     * utilPortalAlterationSampleCountGet
     * @method
     * @name OncoKbPrivateAPI#utilPortalAlterationSampleCountGetUsingGET
     * @param {string} hugoSymbol - hugoSymbol
     */
    utilPortalAlterationSampleCountGetUsingGET(parameters: {
            'hugoSymbol' ? : string,
            $queryParameters ? : any,
                $domain ? : string
        }): Promise < Array < CancerTypeCount >
        > {
            return this.utilPortalAlterationSampleCountGetUsingGETWithHttpInfo(parameters).then(function(response: request.Response) {
                return response.body;
            });
        };
    utilRelevantTumorTypesGetUsingGETURL(parameters: {
        'tumorType' ? : string,
        $queryParameters ? : any
    }): string {
        let queryParameters: any = {};
        let path = '/utils/relevantTumorTypes';
        if (parameters['tumorType'] !== undefined) {
            queryParameters['tumorType'] = parameters['tumorType'];
        }

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                var parameter = parameters.$queryParameters[parameterName];
                queryParameters[parameterName] = parameter;
            });
        }
        let keys = Object.keys(queryParameters);
        return this.domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    };

    /**
     * Get the list of relevant tumor types.
     * @method
     * @name OncoKbPrivateAPI#utilRelevantTumorTypesGetUsingGET
     * @param {string} tumorType - OncoTree tumor type name/main type/code
     */
    utilRelevantTumorTypesGetUsingGETWithHttpInfo(parameters: {
        'tumorType' ? : string,
        $queryParameters ? : any,
            $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        const errorHandlers = this.errorHandlers;
        const request = this.request;
        let path = '/utils/relevantTumorTypes';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise(function(resolve, reject) {
            headers['Accept'] = 'application/json';
            headers['Content-Type'] = 'application/json';

            if (parameters['tumorType'] !== undefined) {
                queryParameters['tumorType'] = parameters['tumorType'];
            }

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
            }

            request('GET', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);

        });
    };

    /**
     * Get the list of relevant tumor types.
     * @method
     * @name OncoKbPrivateAPI#utilRelevantTumorTypesGetUsingGET
     * @param {string} tumorType - OncoTree tumor type name/main type/code
     */
    utilRelevantTumorTypesGetUsingGET(parameters: {
            'tumorType' ? : string,
            $queryParameters ? : any,
                $domain ? : string
        }): Promise < Array < TumorType >
        > {
            return this.utilRelevantTumorTypesGetUsingGETWithHttpInfo(parameters).then(function(response: request.Response) {
                return response.body;
            });
        };
    utilsSuggestedVariantsGetUsingGETURL(parameters: {
        $queryParameters ? : any
    }): string {
        let queryParameters: any = {};
        let path = '/utils/suggestedVariants';

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                var parameter = parameters.$queryParameters[parameterName];
                queryParameters[parameterName] = parameter;
            });
        }
        let keys = Object.keys(queryParameters);
        return this.domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    };

    /**
     * Get All Suggested Variants.
     * @method
     * @name OncoKbPrivateAPI#utilsSuggestedVariantsGetUsingGET
     */
    utilsSuggestedVariantsGetUsingGETWithHttpInfo(parameters: {
        $queryParameters ? : any,
            $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        const errorHandlers = this.errorHandlers;
        const request = this.request;
        let path = '/utils/suggestedVariants';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise(function(resolve, reject) {
            headers['Accept'] = 'application/json';
            headers['Content-Type'] = 'application/json';

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
            }

            request('GET', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);

        });
    };

    /**
     * Get All Suggested Variants.
     * @method
     * @name OncoKbPrivateAPI#utilsSuggestedVariantsGetUsingGET
     */
    utilsSuggestedVariantsGetUsingGET(parameters: {
            $queryParameters ? : any,
                $domain ? : string
        }): Promise < Array < AnnotatedVariant >
        > {
            return this.utilsSuggestedVariantsGetUsingGETWithHttpInfo(parameters).then(function(response: request.Response) {
                return response.body;
            });
        };
    validateTrialsUsingGETURL(parameters: {
        'nctIds' ? : Array < string > ,
            $queryParameters ? : any
    }): string {
        let queryParameters: any = {};
        let path = '/utils/validation/trials';
        if (parameters['nctIds'] !== undefined) {
            queryParameters['nctIds'] = parameters['nctIds'];
        }

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                var parameter = parameters.$queryParameters[parameterName];
                queryParameters[parameterName] = parameter;
            });
        }
        let keys = Object.keys(queryParameters);
        return this.domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    };

    /**
     * Check if clinical trials are valid or not by nctId.
     * @method
     * @name OncoKbPrivateAPI#validateTrialsUsingGET
     * @param {array} nctIds - NCTID list
     */
    validateTrialsUsingGETWithHttpInfo(parameters: {
        'nctIds' ? : Array < string > ,
            $queryParameters ? : any,
            $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        const errorHandlers = this.errorHandlers;
        const request = this.request;
        let path = '/utils/validation/trials';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise(function(resolve, reject) {
            headers['Accept'] = 'application/json';
            headers['Content-Type'] = 'application/json';

            if (parameters['nctIds'] !== undefined) {
                queryParameters['nctIds'] = parameters['nctIds'];
            }

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
            }

            request('GET', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);

        });
    };

    /**
     * Check if clinical trials are valid or not by nctId.
     * @method
     * @name OncoKbPrivateAPI#validateTrialsUsingGET
     * @param {array} nctIds - NCTID list
     */
    validateTrialsUsingGET(parameters: {
        'nctIds' ? : Array < string > ,
            $queryParameters ? : any,
            $domain ? : string
    }): Promise < {} > {
        return this.validateTrialsUsingGETWithHttpInfo(parameters).then(function(response: request.Response) {
            return response.body;
        });
    };
    utilVariantAnnotationGetUsingGETURL(parameters: {
        'hugoSymbol' ? : string,
        'entrezGeneId' ? : number,
        'alteration' ? : string,
        'tumorType' ? : string,
        $queryParameters ? : any
    }): string {
        let queryParameters: any = {};
        let path = '/utils/variantAnnotation';
        if (parameters['hugoSymbol'] !== undefined) {
            queryParameters['hugoSymbol'] = parameters['hugoSymbol'];
        }

        if (parameters['entrezGeneId'] !== undefined) {
            queryParameters['entrezGeneId'] = parameters['entrezGeneId'];
        }

        if (parameters['alteration'] !== undefined) {
            queryParameters['alteration'] = parameters['alteration'];
        }

        if (parameters['tumorType'] !== undefined) {
            queryParameters['tumorType'] = parameters['tumorType'];
        }

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                var parameter = parameters.$queryParameters[parameterName];
                queryParameters[parameterName] = parameter;
            });
        }
        let keys = Object.keys(queryParameters);
        return this.domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    };

    /**
     * Get all the info for the query
     * @method
     * @name OncoKbPrivateAPI#utilVariantAnnotationGetUsingGET
     * @param {string} hugoSymbol - hugoSymbol
     * @param {integer} entrezGeneId - entrezGeneId
     * @param {string} alteration - Alteration
     * @param {string} tumorType - OncoTree tumor type name/main type/code
     */
    utilVariantAnnotationGetUsingGETWithHttpInfo(parameters: {
        'hugoSymbol' ? : string,
        'entrezGeneId' ? : number,
        'alteration' ? : string,
        'tumorType' ? : string,
        $queryParameters ? : any,
            $domain ? : string
    }): Promise < request.Response > {
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        const errorHandlers = this.errorHandlers;
        const request = this.request;
        let path = '/utils/variantAnnotation';
        let body: any;
        let queryParameters: any = {};
        let headers: any = {};
        let form: any = {};
        return new Promise(function(resolve, reject) {
            headers['Accept'] = 'application/json';
            headers['Content-Type'] = 'application/json';

            if (parameters['hugoSymbol'] !== undefined) {
                queryParameters['hugoSymbol'] = parameters['hugoSymbol'];
            }

            if (parameters['entrezGeneId'] !== undefined) {
                queryParameters['entrezGeneId'] = parameters['entrezGeneId'];
            }

            if (parameters['alteration'] !== undefined) {
                queryParameters['alteration'] = parameters['alteration'];
            }

            if (parameters['tumorType'] !== undefined) {
                queryParameters['tumorType'] = parameters['tumorType'];
            }

            if (parameters.$queryParameters) {
                Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
            }

            request('GET', domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);

        });
    };

    /**
     * Get all the info for the query
     * @method
     * @name OncoKbPrivateAPI#utilVariantAnnotationGetUsingGET
     * @param {string} hugoSymbol - hugoSymbol
     * @param {integer} entrezGeneId - entrezGeneId
     * @param {string} alteration - Alteration
     * @param {string} tumorType - OncoTree tumor type name/main type/code
     */
    utilVariantAnnotationGetUsingGET(parameters: {
        'hugoSymbol' ? : string,
        'entrezGeneId' ? : number,
        'alteration' ? : string,
        'tumorType' ? : string,
        $queryParameters ? : any,
            $domain ? : string
    }): Promise < VariantAnnotation > {
        return this.utilVariantAnnotationGetUsingGETWithHttpInfo(parameters).then(function(response: request.Response) {
            return response.body;
        });
    };
}