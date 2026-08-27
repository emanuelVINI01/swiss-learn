-- CreateIndex
CREATE UNIQUE INDEX "WordBase_sourceLang_targetLang_sourceText_key" ON "WordBase"("sourceLang", "targetLang", "sourceText");

