// TODO publish "forbiddenImportRegExpRule" rule on GitHub as the tslint rule

// tslint:disable:no-console
// tslint:disable:max-classes-per-file

import * as path from "path";
import * as Lint from "tslint";
import * as ts from "typescript";

const camelToDash = (str) => str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
const ruleFileCamelName = path.parse(__filename).name;
const ruleFileDashName = camelToDash(ruleFileCamelName);
const ruleDashName = ruleFileDashName.replace(/-rule$/, "");

export class Rule extends Lint.Rules.AbstractRule {
    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new ForbiddenImportRegExpWalker(sourceFile, this.getOptions()));
    }
}

class ForbiddenImportRegExpWalker extends Lint.RuleWalker {
    private readonly BAN_PATH_PREFIX = /src\/lib/;

    public visitImportDeclaration(node: ts.ImportDeclaration) {
        const rootPath = path.resolve(process.cwd());
        const srcFile = path.resolve(node.parent.getSourceFile().fileName);
        const srcFileDir = path.dirname(srcFile);
        const plainImport = node.moduleSpecifier.getText();
        let relativeImportPath = plainImport.replace(/[\"\']/g, "");

        if (relativeImportPath.startsWith(".")) {
            const importPath = path.resolve(srcFileDir, relativeImportPath);
            relativeImportPath = path.relative(rootPath, importPath);
        }

        if (relativeImportPath.match(this.BAN_PATH_PREFIX)) {
            this.addFailure(
                this.createFailure(node.getStart(),
                    node.getWidth(),
                    `${ruleDashName}: ${plainImport} import is blacklisted by the "${this.BAN_PATH_PREFIX}" pattern`,
                ),
            );
        }

        super.visitImportDeclaration(node);
    }
}
