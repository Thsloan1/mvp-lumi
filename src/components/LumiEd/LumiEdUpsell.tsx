@@ .. @@
               <Button
                 onClick={() => setCurrentView('library')}
                 variant="outline"
                 size="lg"
                 icon={BookOpen}
               >
                 Browse Free Library
               </Button>
               <Button
+                onClick={() => setCurrentView('lumied-subscription')}
                 size="lg"
                 icon={ExternalLink}
               >
-                Start Free Trial
+                Subscribe to LumiEd
               </Button>
             </div>
           </div>