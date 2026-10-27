from django.apps import AppConfig


class CalcToolsConfig(AppConfig):
    """Only registers the static files in calc_tools/static/calc_tools/."""

    name = "calc_tools"
    verbose_name = "Calc tools"
