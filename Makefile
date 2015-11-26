default: runserver

runserver:
	python3 -m http.server || python2 -m SimpleHTTPServer
