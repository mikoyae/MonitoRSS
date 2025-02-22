import {
  Alert,
  AlertDescription,
  Box,
  Button,
  Center,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { RepeatIcon, SearchIcon } from "@chakra-ui/icons";
import { Loading, Menu, ThemedSelect } from "@/components";
import { GetArticlesFilterReturnType } from "../../constants";
import { useUserFeedArticleProperties, useUserFeedArticlesWithPagination } from "../../hooks";
import getChakraColor from "../../../../utils/getChakraColor";
import { GetUserFeedArticlesInput } from "../../api";
import { useDebounce } from "../../../../hooks";
import { useGetUserFeedArticlesError } from "../../../feedConnections/hooks";

interface Props {
  feedId: string;
  trigger: React.ReactElement;
  onArticleSelected: (articleId: string) => void;
  onClickRandomArticle: () => void;
  articleFormatter: GetUserFeedArticlesInput["data"]["formatter"];
  singleProperty?: string;
}

export const ArticleSelectDialog = ({
  feedId,
  trigger,
  onArticleSelected,
  onClickRandomArticle,
  articleFormatter,
  singleProperty,
}: Props) => {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const { t } = useTranslation();
  const [selectedArticleProperty, setSelectedArticleProperty] = useState<string | undefined>(
    singleProperty || "title"
  );
  const [search, setSearch] = useState("");
  const { data: feedArticlePropertiesResult, status: feedArticlePropertiesStatus } =
    useUserFeedArticleProperties({ feedId });
  const debouncedSearch = useDebounce(search, 500);
  const {
    data: userFeedArticlesResults,
    status: userFeedArticlesStatus,
    error,
    fetchStatus,
    nextPage,
    prevPage,
    skip,
    limit,
    refetch,
  } = useUserFeedArticlesWithPagination({
    feedId,
    data: {
      selectProperties: selectedArticleProperty
        ? [selectedArticleProperty, "id"]
        : ([
            feedArticlePropertiesResult?.result.properties.find((p) => p === "title") ||
              feedArticlePropertiesResult?.result.properties[0],
          ]
            .concat(["id"])
            .filter((i) => i) as string[]),
      filters: {
        returnType: GetArticlesFilterReturnType.IncludeEvaluationResults,
        search: debouncedSearch,
      },
      formatter: articleFormatter,
    },
  });
  const { alertComponent } = useGetUserFeedArticlesError({
    getUserFeedArticlesStatus: userFeedArticlesStatus,
    getUserFeedArticlesError: error,
    getUserFeedArticlesOutput: userFeedArticlesResults,
  });

  const onChangeFeedArticleProperty = (value: string) => {
    setSelectedArticleProperty(value);
  };

  const onClickArticle = async (articleId?: string) => {
    if (articleId) {
      onArticleSelected(articleId);
    } else {
      onClickRandomArticle();
    }

    onClose();
  };

  useEffect(() => {
    if (singleProperty) {
      setSelectedArticleProperty(singleProperty);
    }
  }, [singleProperty]);

  const useArticleProperty =
    selectedArticleProperty || userFeedArticlesResults?.result.selectedProperties[0];
  const articles = userFeedArticlesResults?.result.articles;
  const totalArticles = userFeedArticlesResults?.result.totalArticles;
  const onFirstPage = skip === 0;
  const onLastPage = !totalArticles || skip + limit >= totalArticles;

  return (
    <>
      {React.cloneElement(trigger, {
        onClick: onOpen,
      })}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t("features.userFeeds.components.articleSelectPrompt.title")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              {/* <Divider /> */}
              <Box>
                {userFeedArticlesStatus === "loading" && (
                  <Stack>
                    <Center>
                      <Loading />
                    </Center>
                    <Center>
                      <Text color="gray.300">
                        {t("features.userFeeds.components.articleSelectPrompt.loadingArticles")}
                      </Text>
                    </Center>
                  </Stack>
                )}
                {alertComponent}
                {articles && (
                  <Stack>
                    <Flex>
                      <HStack alignItems="center" flexGrow={1} flexWrap="wrap">
                        <FormControl flexGrow={1}>
                          <FormLabel>Property</FormLabel>
                          {/* {!singleProperty && ( */}
                          <ThemedSelect
                            options={
                              feedArticlePropertiesResult?.result.properties.map((property) => ({
                                value: property,
                                label: property,
                                data: property,
                              })) || []
                            }
                            isDisabled={
                              feedArticlePropertiesStatus === "loading" || !!singleProperty
                            }
                            loading={feedArticlePropertiesStatus === "loading"}
                            value={useArticleProperty}
                            onChange={onChangeFeedArticleProperty}
                          />
                        </FormControl>
                      </HStack>
                    </Flex>
                    <Stack>
                      <FormControl>
                        <FormLabel>Search</FormLabel>
                        <HStack flexWrap="wrap">
                          <InputGroup flex={1}>
                            <InputLeftElement pointerEvents="none">
                              <SearchIcon color="gray.300" />
                            </InputLeftElement>
                            <Input
                              onChange={(e) => setSearch(e.target.value)}
                              placeholder="Search..."
                            />
                          </InputGroup>
                          <Button
                            leftIcon={<RepeatIcon />}
                            isLoading={fetchStatus === "fetching"}
                            onClick={() => refetch()}
                          >
                            Reload
                          </Button>
                        </HStack>
                      </FormControl>
                    </Stack>
                    <Stack spacing={8} position="relative" rounded="lg">
                      {fetchStatus === "fetching" && (
                        <Flex
                          bg="blackAlpha.700"
                          position="absolute"
                          height="100%"
                          width="100%"
                          rounded="lg"
                          justifyContent="center"
                          alignItems="center"
                        >
                          <Spinner />
                        </Flex>
                      )}
                      <Stack spacing={4} bg="gray.700" rounded="lg">
                        <Box
                          overflow="auto"
                          height="100%"
                          maxHeight={400}
                          border={`solid 2px ${getChakraColor("gray.600")}`}
                          borderRadius="lg"
                        >
                          <Menu
                            items={articles.map((article) => ({
                              id: article.id,
                              title: article[useArticleProperty as never] || (
                                <Text color="gray.400">(empty)</Text>
                              ),
                              value: article.id,
                              description: "",
                            }))}
                            boxProps={{
                              background: "transparent",
                              // border: `solid 2px ${getChakraColor("gray.600")}`,
                            }}
                            onSelectedValue={onClickArticle}
                            shown
                          />
                        </Box>
                      </Stack>
                    </Stack>
                    <Flex justifyContent="space-between" alignItems="center">
                      <Text as="sub">
                        {t("common.table.results", {
                          start: skip + 1,
                          end: skip + limit,
                          total: totalArticles,
                        })}
                      </Text>
                      <HStack>
                        <Button
                          width="min-content"
                          size="sm"
                          onClick={prevPage}
                          isDisabled={onFirstPage || fetchStatus === "fetching"}
                        >
                          {t("features.feedConnections.components.filtersTabSection.prevPage")}
                        </Button>
                        <Button
                          size="sm"
                          width="min-content"
                          onClick={nextPage}
                          isDisabled={onLastPage || fetchStatus === "fetching"}
                        >
                          {t("features.feedConnections.components.filtersTabSection.nextPage")}
                        </Button>
                      </HStack>
                    </Flex>
                  </Stack>
                )}
              </Box>
              {!alertComponent && (
                <>
                  <Alert borderRadius="md">
                    <AlertDescription>
                      <Text fontSize="sm">
                        {t("features.userFeeds.components.articleSelectPrompt.mayBeDelayWarning")}
                      </Text>
                    </AlertDescription>
                  </Alert>
                  <Divider />
                  <Button onClick={() => onClickArticle()} leftIcon={<RepeatIcon />}>
                    {t("features.userFeeds.components.articleSelectPrompt.selectRandom")}
                  </Button>
                </>
              )}
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={onClose}>
              {t("common.buttons.close")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
