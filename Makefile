.PHONY: install

install:
	npm install

commit:
	git commit -a

push:
	git push origin main

build:
	docker build . -t ericdum/tesla-race

publish:
	docker image push ericdum/tesla-race


pb: push build publish

one: commit push build publish
