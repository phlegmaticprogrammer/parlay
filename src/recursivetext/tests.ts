import { Relation, Test, assertEqT, assertT } from "things";
import { RX, compareDocuments, displayDocument, readDocument, simpleRX, writeDocument } from "./rx.js";

export function createExampleDocument<D, B, L>(rx : RX<D, B, L>, index : number = 0) : D {

    let block = rx.block;
    let line = rx.line;
    function paragraph(s : string) : B {
        return block(line(s));
    }

    switch(index) {
        case 0:
            return rx.document(
                block( // comment block
                line("% This is a comment."),
                line("This is the second line of the comment."),
                line("And here is the third one.")
                ),
                block( // theorem 
                    line("theorem Modus-Ponens: B"),
                    paragraph("premise: implies(A, B)"),
                    paragraph("premise: A")
                ),
                block(
                    line("theorem Universal-Introduction:"),
                    paragraph("for-all(x. A[x])"),
                    paragraph("premise: x. A[x]")
                ),
                block(
                    line("theorem Truth-1: true")
                ),
                block(
                    line("theorem Truth-2: implies(A, equals(A, true))")
                ),
                block(
                    line("theorem Implication-1: implies(A, implies(B, A))")
                ),
                block(
                    line("theorem Implication-2:"),
                    block(
                        line("implies"),
                        paragraph("implies(A, implies(B, C))"),
                        paragraph("implies(implies(A, B), implies(B, C))")
                    )
                ),
                block(
                    line("theorem Universal-1: implies(for-all(x. A[x]), A[x])"),
                ),
                block(
                    line("theorem Universal-2:"),
                    block(
                        line("implies"),
                        paragraph("for-all(x. implies(A, B[x]))"),
                        paragraph("implies(A, for-all(x. B[x]))")
                    )
                ),
                paragraph("theorem Equality-1: equals(x, x)"),
                paragraph("theorem Equality-2: implies(equals(x, y), implies(A[x], A[y]))")
            );
        case 1:
            return rx.document(block(block()));
        case 2:
            return rx.document(block(block(line("Hello"), line(" World"))));
        case 3:
            return rx.document(block(block(line(""))));
        default: throw new Error("Unknow example index");
    }
}

function CrashTest(test : () => void, descr? : string) {
    function t() {
        try {
            test();
            assertT(false);
        } catch {}
    }
    Test(t, descr);
}

function testReadWrite<D, B, L>(rx : RX<D, B, L>, doc : D) {
    assertT(compareDocuments(rx, doc, doc) === Relation.EQUAL);
    const text = writeDocument(rx, doc);
    const parsed_doc = readDocument(rx, text);
    assertT(compareDocuments(rx, doc, parsed_doc) === Relation.EQUAL);
}

for (const index of [0, 2, 3]) {
    Test(() => {
        testReadWrite(simpleRX, createExampleDocument(simpleRX, index));
    }, `Write/Read Example ${index}`);
}

CrashTest(() => {
    createExampleDocument(simpleRX, 1);
}, `Create Example 1`);

Test(() => {
    let text = "";
    const doc = readDocument(simpleRX, text);
    let text2 = writeDocument(simpleRX, doc);
    assertEqT(text, text2);
    testReadWrite(simpleRX, doc);
}, "Empty Text <-> Document");

