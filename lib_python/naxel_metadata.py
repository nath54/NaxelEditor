
class NaxelMetaData:

    def __init__(
        self,
        name: str,
        author: str | list[str] = "",
        description: str = "",
        date_created: str = "",
        date_modified: str = "",
        tags: list[str] = [],
        license: str = ""
    ) -> None:

        self.name: str = name
        self.author: str | list[str] = author
        self.description: str = description
        self.date_created: str = date_created
        self.date_modified: str = date_modified
        self.tags: list[str] = tags
        self.license: str = license
