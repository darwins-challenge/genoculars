;(function(lander){
    var updateView = updateMoonlanderView;

    function showError(e) {
        var el = $('#errors');
        el.show().text(el.text() + '\n' + e);
    }

    function animateViaAnimationFrame() {
        return {
            schedule: function(c) { return requestAnimationFrame(c); },
            cancel: function(t) { cancelAnimationFrame(t); },
            frames: function(s) { return s * 60 }
        }
    }

    function animateViaTimer(fps) {
        var period = 1000 / fps;
        return {
            schedule: function(callback) {
                return setTimeout(callback, period);
            },
            cancel: function(t) { clearTimeout(t); },
            frames: function(s) { return s * fps }
        }
    }

    var trace = (function() {
        var WAIT_TIME_S = 2;

        var frame = 0;
        var currentTrace = [];
        var timer = 0;
        var animator = animateViaTimer(45);

        var copyBtn = $('#generation-copy-btn').click(function() {
            var as_text = $.map(traceList.getItems(), function(t) {
                return JSON.stringify(t);
            }).join('\n');
            $('#pasted-trace').val(as_text);
            $('#src-tabs a[href="#paste"]').tab('show')
        }).hide();

        function tick(){
            if (frame < currentTrace.length) {
                updateView(currentTrace[frame]);
            }
            if (currentTrace.length + animator.frames(WAIT_TIME_S) < frame) {
                frame = 0;
            }
            frame++;
            timer = animator.schedule(tick);
        };

        function selectTrace(t) {
            trace.play(statesFromTrace(t));
            renderScoreTable($('#score-table'), t.fitness.score_card._field0);
            $('#program-pane').html(htmlifyProgram(programFromTrace(t)));
        };

        function programFromTrace(t) {
            var program = t.program;
            if (program._field0) return t.program._field0;
            return program;
        }
        function statesFromTrace(t) { return t.fitness.trace; }
        function generationFromTrace(t) { return t.generation; }
        function totalScoreFromTrace(t) { return t.fitness.score_card._field1; }

        var traceList = ItemList($('#generation-list'), function(t) {
            // Determine captions for generations
            var frames = statesFromTrace(t);
            return [
                'Gen ' + generationFromTrace(t),
                totalScoreFromTrace(t).toFixed(0),
                frames[frames.length-1].landed ? 'successful': 'unsuccessful'
                ];
        }, selectTrace);

        return {
            play: function(trace) {
                currentTrace = trace;
                frame = 0;
                if (!timer) timer = animator.schedule(tick);
            },
            stop: function() {
                animator.cancel(timer);
                timer = 0;
            },
            setTraces: function(traces) {
                traceList.update(traces);
                copyBtn.toggle(traces != null && traces.length > 0);
            },
            loadFromText: function(contents) {
                var lines = contents.split('\n');
                var traces = [];
                for (var i = 0; i < lines.length; i++) {
                    try {
                        traces.push(JSON.parse(lines[i]));
                    } catch (e) {
                        if (e instanceof SyntaxError)
                            continue;
                        throw e;
                    }
                };
                traceList.update(traces);
                copyBtn.toggle(traces != null && traces.length > 0);
            }
        };

    }());

    //----------------------------------------------------------------------
    //  Load traces from disk
    $(function() {
        var runFs = FileSelector($('#load-file-selector'), '/api/load/list', showError).select(function(f) {
            $('#load-buttons').toggle(f != null);
        });

        $('#load-btn').click(function() {
            load(runFs.getSelection().join('/'));
        });

        function load(filename) {
            $.get("/api/load/get/" + filename, function(contents) {
                trace.loadFromText(contents);
            });
        }
    });

    //----------------------------------------------------------------------
    //  Load traces from pasteboard
    $(function() {
        $('#load-paste-btn').click(function() {
            trace.loadFromText($('#pasted-trace').val());
        });
    });

    //----------------------------------------------------------------------
    function renderScoreTable(el, rows) {
        rows.sort(function(a, b) { return b[1] - a[1]; });
        el.empty().append($.map(rows, function(x) {
            return $('<tr>').append(
                $('<td>', { text: x[0] }),
                $('<td>', { text: humanNum(x[1]) }));
        }));
    }

})(lander);
