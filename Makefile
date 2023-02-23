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
	docker publish


pb: push build

one: commit push build publish
