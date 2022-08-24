# icosa
The common library used by the websites ([hivdb.stanford.edu](https://hivdb.stanford.edu) and [covdb.stanford.edu](https://covdb.stanford.edu)) created by HIVDB team. This library uses React to create views and components.

## Views and Components

### HIV Analysis Program

The HIVdb/HIVseq/HIValg programs share the same code base [`src/views/hiv`](https://github.com/hivdb/icosa/tree/main/src/views/hiv). Config JSON files are hosted on [cms.hivdb.org](https://cms.hivdb.org) for the different programs. Here are the source YAML files:

- HIVdb: https://github.com/hivdb/hivdb-cms/blob/master/pages/sierra-hivpol.yml
- HIVdb-capsid: https://github.com/hivdb/hivdb-cms/blob/master/pages/sierra-hivca.yml
- HIVdb-HIV2: https://github.com/hivdb/hivdb-cms/blob/master/pages/sierra-hiv2.yml
- HIVseq: https://github.com/hivdb/hivdb-cms/blob/master/pages/sierra-hivseq.yml
- HIValg: https://github.com/hivdb/hivdb-cms/blob/master/pages/sierra-hivalg.yml

These YAML files need to be built into JSON format by `make build` command of `hivdb/hivdb-cms` repo before deployed to [cms.hivdb.org](https://cms.hivdb.org).

### SARS-CoV-2 Analysis Program

The [`src/views/sars2`](https://github.com/hivdb/icosa/tree/main/src/views/sars2) is the code base for the SARS-CoV-2 analysis program. It shares core components with HIV Analysis Program but has individual views and configurations for obivious reasons. The config JSON file is also hosted on [cms.hivdb.org](https://cms.hivdb.org). Here is the source YAML file:

- https://github.com/hivdb/chiro-cms/blob/main/pages/sierra-sars2.yml

Like HIV Analysis Program, this YAML file also need to be built into JSON format by `make build` command of `hivdb/chiro-cms` repo.

### Markdown renderer

The [`src/components/markdown`](https://github.com/hivdb/icosa/tree/main/src/components/markdown) component wraps and extends [`react-markdown`](https://github.com/remarkjs/react-markdown) for rendering Markdowns from cms.hivdb.org. It is the core component of the `/page/` prefixed pages on hivdb and covdb websites.

### Genome map

The [`src/components/genome-map`](https://github.com/hivdb/icosa/tree/main/src/components/genome-map) component plots a genome map and mutations according to input definitions. It is the core component of [the SARS-CoV-2 variants](https://covdb.stanford.edu/variants/) page.

### Simple table

The [`src/components/simple-table`](https://github.com/hivdb/icosa/tree/main/src/components/simple-table) component renders a sortable table using input column definitions and table data. Many tables hosted on hivdb and covdb websites depends on this component.

## Development

The development environment of Icosa requires NodeJS and Yarn. Once the latest versions installed:

```bash
cd icosa
yarn && yarn start
```

This command will host a service on http://localhost:3009. It requires [Sierra-HIV](https://github.com/hivdb/sierra)/[Sierra-SARS2](https://github.com/hivdb/sierra-sars2) running as the backends for running/developing the HIV/SARS-CoV-2 Sequence Analysis Programs.
