package screenshots;

public class NoReferenceScreenshotFoundException extends Throwable {
    public NoReferenceScreenshotFoundException(String name) {
        super("no reference screenshot found for " + name);
    }
}
