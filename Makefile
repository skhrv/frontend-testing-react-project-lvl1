install: install-deps

run:
	bin/nodejs-package.js

install-deps:
	npm ci

test:
	npm test -- --silent

test-coverage:
	npm test -- --coverage --coverageProvider=v8

lint:
	npx eslint .

publish:
	npm publish

.PHONY: test
